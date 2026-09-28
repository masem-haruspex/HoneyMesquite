package org.mm.FinanceTracker.Receivables;

import org.mm.FinanceTracker.Accounting.JournalEntry;
import org.mm.FinanceTracker.Accounting.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/receivables")
public class AccountsReceivableController {

	@Autowired
	ClientRepository clientRepository;

	@Autowired
	AccountsReceivableRepository receivableRepository;

	@Autowired
	JournalEntryRepository journalEntryRepository;

	@GetMapping("/")
	public ResponseEntity<List<AccountsReceivable>> getAllReceivables() {
		List<AccountsReceivable> result = new ArrayList<>();
		receivableRepository.findAll().forEach(result::add);
		return result.isEmpty()
			? new ResponseEntity<>(HttpStatus.NO_CONTENT)
			: new ResponseEntity<>(result, HttpStatus.OK);
	}

	@PostMapping("/")
	@Transactional
	public ResponseEntity<AccountsReceivable> createReceivable(
			@RequestBody AccountsReceivableRequest request) {
			Client client = clientRepository.findById(request.clientId())
				.orElseThrow(() -> new RuntimeException("Client not found"));

			LocalDate dueDate = request.issuedDate().plusDays(client.getPaymentTerms());

			AccountsReceivable receivable = new AccountsReceivable(
					client,
					request.invoiceNumber(),
					request.amount(),
					request.issuedDate(),
					dueDate,
					0,
					"OUTSTANDING",
					request.collectionStage(),
					request.probabilityOfPayment(),
					request.lastReminderDate()
					);

			AccountsReceivable saved = receivableRepository.save(receivable);
			createJournalEntryForReceivable(saved);

			return new ResponseEntity<>(saved, HttpStatus.CREATED);
			}

	private void createJournalEntryForReceivable(AccountsReceivable ar) {
		String ref = "AR-" + ar.getId();

		// Debit Receivable (1100)
		JournalEntry debit = new JournalEntry();
		debit.setDescription("Invoice: " + ar.getInvoiceNumber() + " to " + ar.getClient().getName());
		debit.setAccountCode("1100");
		debit.setDebitAmount(ar.getAmount());
		debit.setAmount(ar.getAmount());
		debit.setReferenceNumber(ref);
		debit.setReceivableId(ar.getId());

		// Credit Revenue (4000)
		JournalEntry credit = new JournalEntry();
		credit.setDescription("Invoice: " + ar.getInvoiceNumber() + " to " + ar.getClient().getName());
		credit.setAccountCode("4000");
		credit.setCreditAmount(ar.getAmount());
		credit.setAmount(ar.getAmount());
		credit.setReferenceNumber(ref);
		credit.setReceivableId(ar.getId());

		journalEntryRepository.save(debit);
		journalEntryRepository.save(credit);
	}

	@PutMapping("/{id}")
	@Transactional
	public ResponseEntity<AccountsReceivable> updateReceivable(
			@PathVariable Long id,
			@RequestBody AccountsReceivableRequest request) {
			return receivableRepository.findById(id)
				.map(receivable -> {
					Client client = clientRepository.findById(request.clientId())
						.orElseThrow(() -> new RuntimeException("Client not found"));

					LocalDate dueDate = request.issuedDate().plusDays(client.getPaymentTerms());

					receivable.setClient(client);
					receivable.setInvoiceNumber(request.invoiceNumber());
					receivable.setAmount(request.amount());
					receivable.setIssuedDate(request.issuedDate());
					receivable.setDueDate(dueDate);
					receivable.setCollectionStage(request.collectionStage());
					receivable.setProbabilityOfPayment(request.probabilityOfPayment());
					receivable.setLastReminderDate(request.lastReminderDate());

					AccountsReceivable updated = receivableRepository.save(receivable);
					return new ResponseEntity<>(updated, HttpStatus.OK);
				})
			.orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
			}

	@PutMapping("/{id}/status")
	@Transactional
	public ResponseEntity<AccountsReceivable> updateCollectionStatus(
			@PathVariable Long id,
			@RequestParam CollectionStage status) {
			AccountsReceivable receivable = receivableRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Receivable not found"));
			receivable.setCollectionStage(status);
			receivable.setLastReminderDate(LocalDateTime.now());
			return new ResponseEntity<>(receivableRepository.save(receivable), HttpStatus.OK);
			}

	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<HttpStatus> deleteReceivable(@PathVariable Long id) {
		if (!receivableRepository.existsById(id)) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		receivableRepository.deleteById(id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

	@GetMapping("/aging/")
	public ResponseEntity<List<AccountsReceivable>> getAgingReport() {
		return new ResponseEntity<>(
				receivableRepository.findByStatusNot("PAID"),
				HttpStatus.OK
				);
	}
}

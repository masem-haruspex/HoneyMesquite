package org.mm.FinanceTracker.CashFlow.controllers;

import jakarta.validation.Valid;
import org.mm.FinanceTracker.CashFlow.models.*;
import org.mm.FinanceTracker.CashFlow.repositories.CriticalAccountRepository;
import org.mm.FinanceTracker.CashFlow.repositories.LiquidityEventRepository;
import org.mm.FinanceTracker.CashFlow.requests.CriticalAccountRequest;
import org.mm.FinanceTracker.CashFlow.requests.LiquidityEventRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/cashflow/liquidity")
public class LiquidityEventController {

    @Autowired
    private LiquidityEventRepository liquidityEventRepository;

    @Autowired
    private CriticalAccountRepository criticalAccountRepository;

    @GetMapping("/")
    public ResponseEntity<List<LiquidityEvent>> getAllEvents(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        List<LiquidityEvent> result = new ArrayList<>();

        if (startDate != null && endDate != null) {
            liquidityEventRepository.findByDateBetween(startDate, endDate).forEach(result::add);
        } else {
            liquidityEventRepository.findAll().forEach(result::add);
        }

        return result.isEmpty()
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{date}")
    public ResponseEntity<LiquidityEvent> getEventByDate(
            @PathVariable LocalDate date) {

        return liquidityEventRepository.findById(date)
                .map(event -> new ResponseEntity<>(event, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    @Transactional
    public ResponseEntity<LiquidityEvent> createEvent(
            @Valid @RequestBody LiquidityEventRequest request) {

        if (liquidityEventRepository.existsById(request.date())) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        LiquidityEvent event = new LiquidityEvent(
                request.date(),
                request.cashIn(),
                request.cashOut(),
                request.balance()
        );

        LiquidityEvent savedEvent = liquidityEventRepository.save(event);

        if (request.criticalAccounts() != null && !request.criticalAccounts().isEmpty()) {
            request.criticalAccounts().forEach(accountRequest -> {
                CriticalAccount account = new CriticalAccount(
                        savedEvent,
                        accountRequest.name(),
                        accountRequest.balance(),
                        accountRequest.minThreshold()
                );
                criticalAccountRepository.save(account);
            });
        }

        return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
    }

    @PutMapping("/{date}")
    @Transactional
    public ResponseEntity<LiquidityEvent> updateEvent(
            @PathVariable LocalDate date,
            @Valid @RequestBody LiquidityEventRequest request) {

        return liquidityEventRepository.findById(date)
                .map(existingEvent -> {
                    existingEvent.setCashIn(request.cashIn());
                    existingEvent.setCashOut(request.cashOut());
                    existingEvent.setBalance(request.balance());

                    if (request.criticalAccounts() != null) {
                        criticalAccountRepository.deleteByLiquidityEventDate(date);

                        request.criticalAccounts().forEach(accountRequest -> {
                            CriticalAccount account = new CriticalAccount(
                                    existingEvent,
                                    accountRequest.name(),
                                    accountRequest.balance(),
                                    accountRequest.minThreshold()
                            );
                            criticalAccountRepository.save(account);
                        });
                    }

                    return new ResponseEntity<>(liquidityEventRepository.save(existingEvent), HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{date}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteEvent(
            @PathVariable LocalDate date) {

        if (!liquidityEventRepository.existsById(date)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        criticalAccountRepository.deleteByLiquidityEventDate(date);

        liquidityEventRepository.deleteById(date);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{date}/accounts")
    public ResponseEntity<List<CriticalAccount>> getCriticalAccounts(
            @PathVariable LocalDate date) {

        List<CriticalAccount> accounts = criticalAccountRepository.findByLiquidityEventDate(date);
        return accounts.isEmpty()
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(accounts, HttpStatus.OK);
    }

    @PostMapping("/{date}/accounts")
    @Transactional
    public ResponseEntity<CriticalAccount> addCriticalAccount(
            @PathVariable LocalDate date,
            @Valid @RequestBody CriticalAccountRequest request) {

        return liquidityEventRepository.findById(date)
                .map(event -> {
                    CriticalAccount account = new CriticalAccount(
                            event,
                            request.name(),
                            request.balance(),
                            request.minThreshold()
                    );
                    return new ResponseEntity<>(criticalAccountRepository.save(account), HttpStatus.CREATED);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/threshold-alerts")
    public ResponseEntity<List<CriticalAccount>> getBelowThresholdAccounts() {
        List<CriticalAccount> accounts = criticalAccountRepository.findBelowThreshold();
        return accounts.isEmpty()
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(accounts, HttpStatus.OK);
    }
}

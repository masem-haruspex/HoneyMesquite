package org.mm.FinanceTracker.CashFlow.controllers;

import jakarta.validation.Valid;
import org.mm.FinanceTracker.CashFlow.models.*;
import org.mm.FinanceTracker.CashFlow.repositories.*;
import org.mm.FinanceTracker.CashFlow.requests.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("api/cashflow/scenarios")
public class ScenarioController {

    private final ScenarioRepository scenarioRepository;
    private final ScenarioNodeRepository nodeRepository;
    private final ScenarioEdgeRepository edgeRepository;

    @Autowired
    public ScenarioController(ScenarioRepository scenarioRepository,
                              ScenarioNodeRepository nodeRepository,
                              ScenarioEdgeRepository edgeRepository) {
        this.scenarioRepository = scenarioRepository;
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }


    @GetMapping
    public ResponseEntity<List<Scenario>> getAllScenarios() {
        List<Scenario> scenarios = scenarioRepository.findAll();
        return ResponseEntity.ok(scenarios);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Scenario> createScenario(@Valid @RequestBody ScenarioRequest request) {
        Scenario scenario = new Scenario(
                request.name(),
                request.probability(),
                request.expectedValue()
        );
        Scenario savedScenario = scenarioRepository.save(scenario);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedScenario);
    }


    @GetMapping("/{scenarioId}/nodes")
    public ResponseEntity<List<ScenarioNode>> getNodes(@PathVariable Long scenarioId) {
        List<ScenarioNode> nodes = nodeRepository.findByScenario(scenarioId);
        return nodes.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(nodes);
    }

    @PostMapping("/{scenarioId}/nodes")
    @Transactional
    public ResponseEntity<ScenarioNode> addNode(
            @PathVariable Long scenarioId,
            @Valid @RequestBody ScenarioNodeRequest request) {

        Scenario scenario = getScenarioOrThrow(scenarioId);

        if (nodeRepository.existsByScenarioAndNodeId(scenarioId, request.nodeId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Node ID already exists for this scenario");
        }

        ScenarioNode node = new ScenarioNode();
        node.setScenario(scenarioId); 
        node.setNodeId(request.nodeId());
        node.setType(request.type());
        node.setLabel(request.label());
        node.setPositionX(request.positionX());
        node.setPositionY(request.positionY());
        node.setAmount(request.amount());
        node.setProbability(request.probability());
        node.setImpact(request.impact());
        node.setScenarioRef(scenario); 

        ScenarioNode savedNode = nodeRepository.save(node);
        scenario.addNode(savedNode);
        scenarioRepository.save(scenario);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedNode);
    }


    @GetMapping("/{scenarioId}/edges")
    public ResponseEntity<List<ScenarioEdge>> getEdges(@PathVariable Long scenarioId) {
        List<ScenarioEdge> edges = edgeRepository.findByScenarioId(scenarioId);
        return edges.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(edges);
    }

    @PostMapping("/{scenarioId}/edges")
    @Transactional
    public ResponseEntity<ScenarioEdge> addEdge(
            @PathVariable Long scenarioId,
            @Valid @RequestBody ScenarioEdgeRequest request) {

        Scenario scenario = getScenarioOrThrow(scenarioId);

        ScenarioNode source = nodeRepository.findByScenarioAndNodeId(scenarioId, request.sourceNodeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Source node not found"));

        ScenarioNode target = nodeRepository.findByScenarioAndNodeId(scenarioId, request.targetNodeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Target node not found"));

        ScenarioEdge edge = new ScenarioEdge();
        edge.setScenario(scenario);
        edge.setSource(source);
        edge.setTarget(target);
        edge.setLabel(request.label());
        edge.setAnimated(request.animated() != null ? request.animated() : false);

        ScenarioEdge savedEdge = edgeRepository.save(edge);
        scenario.addEdge(savedEdge);
        scenarioRepository.save(scenario);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedEdge);
    }

    @PutMapping("/edges/{edgeId}")
    @Transactional
    public ResponseEntity<ScenarioEdge> updateEdge(
            @PathVariable Long edgeId,
            @Valid @RequestBody ScenarioEdgeRequest request) {

        ScenarioEdge edge = edgeRepository.findById(edgeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Edge not found"));

        edge.setLabel(request.label());
        edge.setAnimated(request.animated() != null ? request.animated() : false);

        return ResponseEntity.ok(edgeRepository.save(edge));
    }

    @DeleteMapping("/edges/{edgeId}")
    @Transactional
    public ResponseEntity<Void> deleteEdge(@PathVariable Long edgeId) {
        if (!edgeRepository.existsById(edgeId)) {
            return ResponseEntity.notFound().build();
        }
        edgeRepository.deleteById(edgeId);
        return ResponseEntity.noContent().build();
    }


    private Scenario getScenarioOrThrow(Long scenarioId) {
        return scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Scenario not found"));
    }
}

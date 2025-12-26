package com.go.ai.controller;

import com.go.ai.dto.AIRequest;
import com.go.ai.dto.AIResponse;
import com.go.ai.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/comment")
    public AIResponse getComment(@RequestBody AIRequest request) {
        return aiService.getComment(request);
    }
}


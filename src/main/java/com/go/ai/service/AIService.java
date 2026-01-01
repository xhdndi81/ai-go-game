package com.go.ai.service;

import com.go.ai.dto.AIRequest;
import com.go.ai.dto.AIResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AIService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    public AIResponse getComment(AIRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String systemPrompt = "당신은 세계 최고의 바둑 프로이자 아이들을 가르치는 선생님입니다. " +
                "현재 바둑판 상태를 분석하여 아이의 수에 대해 친절하게 코멘트해주세요. " +
                "아이의 실력에 상관없이 절대로 봐주지 말고 승리하기 위한 전략을 세우세요. " +
                "하지만 멘트는 아이가 상처받지 않게 '와! 이 수 정말 날카로운데요? 저도 집중해야겠어요!' 처럼 " +
                "아이의 도전을 격려하는 친절한 한국어로 작성하세요. " +
                "일반적인 피드백은 이름 없이 자연스럽게 작성하고, " +
                "특별한 상황(게임 시작, 중요한 수, 포획 발생, 게임 종료)에서만 아이의 이름을 부르세요. " +
                "응답은 반드시 JSON 형식: {\"move\": \"좌표\", \"comment\": \"멘트\"} 로만 보내세요. " +
                "move 필드는 실제로 둔 수가 아니라 코멘트용이므로 빈 문자열이나 \"\"로 보내도 됩니다.";

        // 상황 정보를 기반으로 프롬프트 구성
        StringBuilder userPromptBuilder = new StringBuilder();
        userPromptBuilder.append("현재 바둑 상태: ").append(request.getBoardState());
        userPromptBuilder.append("\n현재 차례: ").append(request.getTurn());
        userPromptBuilder.append("\n대결 상대(아이)의 이름: ").append(request.getUserName());
        
        // 상황 정보 추가
        boolean shouldUseName = false;
        if (Boolean.TRUE.equals(request.getIsGameStart())) {
            userPromptBuilder.append("\n상황: 게임이 막 시작되었습니다.");
            shouldUseName = true;
        }
        if (Boolean.TRUE.equals(request.getIsGameEnd())) {
            userPromptBuilder.append("\n상황: 게임이 종료되었습니다.");
            shouldUseName = true;
        }
        if (Boolean.TRUE.equals(request.getHasCapture())) {
            userPromptBuilder.append("\n상황: 포획이 발생했습니다.");
            shouldUseName = true;
        }
        if (Boolean.TRUE.equals(request.getIsImportantMove())) {
            userPromptBuilder.append("\n상황: 중요한 수가 두어졌습니다.");
            shouldUseName = true;
        }
        
        if (shouldUseName) {
            userPromptBuilder.append("\n**이 상황에서는 아이의 이름을 부르면서 칭찬이나 격려의 멘트를 작성하세요.**");
        } else {
            userPromptBuilder.append("\n**일반적인 피드백이므로 이름 없이 자연스럽게 코멘트를 작성하세요.**");
        }
        
        String userPrompt = userPromptBuilder.toString();

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));

        body.put("messages", messages);
        body.put("response_format", Map.of("type", "json_object"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            String responseStr = restTemplate.postForObject(apiUrl, entity, String.class);
            JsonNode root = objectMapper.readTree(responseStr);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            return objectMapper.readValue(content, AIResponse.class);
        } catch (Exception e) {
            log.error("Error calling OpenAI API", e);
            return new AIResponse("", "미안해요, 잠시 생각 중 오류가 발생했어요. 다시 한번만 두어 볼래요?");
        }
    }
}


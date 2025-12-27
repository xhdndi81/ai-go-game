package com.go.ai.controller;

import com.go.ai.entity.GameHistory;
import com.go.ai.entity.User;
import com.go.ai.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> request) {
        return userService.loginOrRegister(request.get("name"));
    }

    @GetMapping("/history/{userId}")
    public List<GameHistory> getHistory(
            @PathVariable Long userId,
            @RequestParam(required = false, defaultValue = "GO") String gameType) {
        // 기본값은 GO (바둑), 필요시 CHESS, OTHELLO 등으로 변경 가능
        GameHistory.GameType type = GameHistory.GameType.valueOf(gameType.toUpperCase());
        return userService.getGameHistory(userId, type);
    }

    @PostMapping("/history/{userId}")
    public void saveHistory(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        String resultStr = (String) request.get("result");
        int movesCount = request.get("movesCount") instanceof Integer ? (Integer) request.get("movesCount")
                : ((Number) request.get("movesCount")).intValue();
        String opponentName = (String) request.getOrDefault("opponentName", "AI");
        userService.saveGameResult(userId, GameHistory.GameResult.valueOf(resultStr.toUpperCase()), movesCount,
                opponentName, GameHistory.GameType.GO);
    }
}

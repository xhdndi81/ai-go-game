package com.go.ai.repository;

import com.go.ai.entity.GameRoom;
import com.go.ai.entity.GoGameData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GoGameDataRepository extends JpaRepository<GoGameData, Long> {
    Optional<GoGameData> findByRoom(GameRoom room);
}


# Backend Patterns & Code Style

| Раздел                  | TL;DR / что запомнить                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Packages**            | `com.yourorg.secretsanta.<feature>` – одно слово; если не выходит → акроним. |
| **Классы / интерфейсы** | `PascalCase`, интерфейсы c префиксом **I** (`IEventService`).                |
| **Методы / переменные** | `camelCase` – `generateAssignments()`, `participantEmail`.                   |
| **Константы**           | `UPPER_SNAKE_CASE` – `DEFAULT_DRAW_DATE`.                                    |
| **DTO / Commands**      | `ParticipantDto`, `CreateEventRequest`, `AssignmentResponse`.                |
| **Паттерны**            | Repository → Service → Controller, + Facade, Strategy, Builder.              |
| **Булин-геттеры**       | `isAnonymousDraw()`, `hasActiveEvent()`.                                     |
| **Слои**                | *domain* ↔︎ *application* ↔︎ *infrastructure* ↔︎ *web*.                      |
| **Тесты**               | `*Test.java` под `src/test/java`: unit / integration / slice.                |

---

## 1. Packages

```
com.yourorg.secretsanta
 ├─ controllers    # Rest контроллеры
 ├─ ws             # Web Socket`ы
 ├─ services       # бизнес-логика, деление дальше на "users", "games" etc.
 ├─ repositories   # репозитории, абстракция над бд, так же дальшая иерархия
 ├─ models         # Энтиты, модели, enum`s, дальшая иерархия
 ├─ dto            # Дата трансфер обжект, дальшая иерархия
 ├─ config         # Spring-конфиги (CORS, security…)
 └─ common         # utils, exceptions
```

* Одно слово. Если слишком длинно → `evt`, `part`, `assign`. Избегаем каскада `service.service` или «tech-label» пакетов вроде `impl`, `util` внутрь бизнес-кода.
* Интерфейсы нужно хранить в том же пакете, в котором находится его реализация
* Если какого то пакета нету выше в перечисленных, создайте)))).
* Dev-profile переменные храним в **`application-dev.yml`**; никакой логики – только placeholder-ы под `${ENV_VAR}`.&#x20;

---

## 2. Классы и интерфейсы

| Пример                           | Назначение                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `EventController`                | REST-слой (`@RestController`).                                                                |
| `IEventService` / `EventService` | Бизнес-логика. Контракты отделены интерфейсом.                                                |
| `GiftAssignmentRepository`       | JPA / Mongo access.                                                                           |
| `EventFacade`                    | «Единая точка» для всего, что касается Event: создали → добавили участников → запустили draw. |

> **Builder / Parameter Object** – при > 3-х параметрах или наличии boolean-флагов.
> `Event.builder().name("Office 2025").budget(20).anonymous(true).build();`

---

## 3. Методы, поля, константы

```java
public class EventService implements IEventService {

    private final GiftAssignmentRepository assignmentRepo;

    public List<AssignmentDto> generateAssignments(String eventId,
                                                   List<String> participantIds,
                                                   boolean anonymous) { ... }

    private static final int MAX_RETRY = 5;
}
```

* Булин-геттер: `isAnonymous()`, `hasBudgetLimit()`.
* **Никогда**: `isNotSomething()`.

---

## 4. DTO / Command-объекты

| Тип          | Пример               | Используем когда…                            |
| ------------ | -------------------- | -------------------------------------------- |
| **Request**  | `CreateEventRequest` | от клиента в Controller.                     |
| **Response** | `AssignmentResponse` | наружу из Controller.                        |
| **Dto**      | `ParticipantDto`     | внутри сервисного слоя или маппинг к фронту. |

> Ломаем большие объекты на специфичные DTO, не таскаем Entity наружу.

---

## 5. Архитектурные паттерны

| Паттерн                        | Где используем                                                    | Коротко                           |
| ------------------------------ | ----------------------------------------------------------------- | --------------------------------- |
| **Repository**                 | `*Repository`                                                     | абстракция БД.                    |
| **Service**                    | `*Service`                                                        | чистая бизнес-логика.             |
| **Controller**                 | `*Controller`                                                     | HTTP-приёмник, 0 бизнес-логики.   |
| **Facade**                     | `EventFacade`, `UserFacade`                                       | оборачиваем связанную подсистему. |
| **Strategy**                   | `DrawStrategy` (+ `ClassicDrawStrategy`, `AvoidanceDrawStrategy`) | разные алгоритмы жеребьёвки.      |
| **Builder / Parameter Object** | `Event.Builder`, `AssignmentParams`                               | длинные конструкторы.             |
| **Enum** | `Roles.<type>`, `GameStatuses.<type>`                               | Любые повторные перечисления.             |

---

## 6. Разделение слоёв

```
┌─────────────┐   DTO/Command   ┌───────────┐
│ Controller  │ ───────────────▶│  Service  │
└─────────────┘                 └────┬──────┘
            ▲                        │ Entity
            │                        ▼
        HTTP│                    ┌───────────┐
            │    Repo <─JPA/Mng─ │Repository │
            ▼                    └───────────┘
        Web/REST            Infrastructure (DB)
```

* Внешние слои **не** знают о внутренних: Controller видит только Service / Facade.
* `UserServiceFacade`  – фасад, а не «жирный» сервис: инкапсулирует `UserProfileService`, `UserNotificationService` и прочее.&#x20;

---

## 7. Булин-геттеры

```java
public class Assignment {
    private boolean anonymousDraw;

    public boolean isAnonymousDraw() {          // ✔
        return anonymousDraw;
    }
}
```

*Простой префикс **is/has** → читаемый код.*
`isNotChotoTam()` — 🚫, моветон.&#x20;

---

## 8. Тестирование

| Тип                  | Где                                                     | Инструменты / аннотации                                           |
| -------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| **Unit-test**        | `src/test/java`                                         | JUnit 5, Mockito, AssertJ. Имена: `EventServiceTest`.             |
| **Slice-test**       | `@WebMvcTest`, `@DataMongoTest`                         | проверяем слой изолированно.                                      |
| **Integration-test** | `@SpringBootTest(classes = TestContainersConfig.class)` | поднимаем Mongo/Postgres в Testcontainers, проверяем полный флоу. |

Нейминг: `*Test.java` (unit & slice) / `*IT.java` (integration) по желанию команды.
Запускаются в CI перед `mvn package`.

---

## 9. application-dev.yml

```yaml
spring:
  profiles:
    active: dev

mongo:
  uri: ${MONGO_URI}        # задаётся через .env или docker-compose
```

* Единственное назначение – *прокинуть* переменные окружения в Spring через `${…}`.
* Не дублируем настройки production, не храним секреты.

---

## 10. TL;DR

> **“Одна ответственность, одно слово, один паттерн”**
> Соблюдаем читаемые имена, чётко отделяем слои, не смешиваем HTTP, бизнес-логику и БД. Тестируем каждый уровень отдельно, а потом целиком.

---

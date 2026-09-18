# Domain model

One entity: a Todo on the single shared list, created by whichever signed-in
user added it and toggled or removed by any signed-in user.

```mermaid
erDiagram
    TODO {
        string id PK
        string text
        boolean done
        string createdBy
        datetime createdAt
    }
```

`createdBy` records the username of the user who added the item, for display
only — it never restricts who may complete or delete it.
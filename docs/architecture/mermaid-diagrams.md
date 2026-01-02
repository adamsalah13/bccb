# AI-Native Micro-Credentials Platform - Mermaid Diagrams

This document contains all the Mermaid diagrams visualizing the system architecture, data flows, and decision logic for the BCCB micro-credentials platform.

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Application State Machine](#application-state-machine)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Micro-Credentials Form Structure](#micro-credentials-form-structure)
5. [Recognition Logic Flow](#recognition-logic-flow)
6. [Pathways Decision Tree](#pathways-decision-tree)
7. [AI Conversation Flow](#ai-conversation-flow)
8. [Entity Relationship Diagram](#entity-relationship-diagram)
9. [AI Recommendation Engine Logic](#ai-recommendation-engine-logic)

---

## System Architecture Overview

```mermaid
graph TB
    A[User Entry Point] --> B{AI Assessment Engine}
    B --> C[Program Details Module]
    B --> D[Recognition Module]
    B --> E[Pathways Module]
    
    C --> F[Data Collection Layer]
    D --> F
    E --> F
    
    F --> G[Validation Engine]
    G --> H[Recommendation System]
    H --> I[Output Generation]
    
    style B fill:#4A90E2
    style H fill:#7ED321
    style I fill:#F5A623
```

## Application State Machine

```mermaid
stateDiagram-v2
    [*] --> ProgramOverview
    ProgramOverview --> ProgramDetails: Select Credential
    ProgramDetails --> Recognition: Complete Details
    Recognition --> Pathways: Complete Recognition
    Pathways --> Assessment: Complete Pathways
    Assessment --> Review: Generate Report
    Review --> [*]: Submit
    
    ProgramDetails --> ProgramDetails: Edit/Refine
    Recognition --> Recognition: Add More Details
    Pathways --> Pathways: Modify Pathways
    
    note right of Recognition
        AI validates institutional
        approval and credit status
    end note
    
    note right of Pathways
        AI suggests pathways based
        on existing credentials
    end note
```

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph Input["Input Layer"]
        A1[User Data]
        A2[Institution Data]
        A3[Program Data]
    end
    
    subgraph Processing["AI Processing Layer"]
        B1[Pattern Recognition]
        B2[Eligibility Analysis]
        B3[Pathway Matching]
        B4[Credit Assessment]
    end
    
    subgraph Output["Output Layer"]
        C1[Recommendations]
        C2[Validation Results]
        C3[Pathway Options]
        C4[Assessment Report]
    end
    
    A1 & A2 & A3 --> B1
    B1 --> B2 & B3 & B4
    B2 --> C1 & C2
    B3 --> C3
    B4 --> C2 & C4
    
    style Processing fill:#E8F4F8
    style Output fill:#F0F8E8
```

## Micro-Credentials Form Structure

```mermaid
graph TD
    subgraph Header["Program Header"]
        H1[BCIT Animal Cell Culture]
        H2[Status: Published/Draft]
        H3[Credits Display]
    end
    
    subgraph Core["Core Information"]
        C1[MC Code: 26.0406]
        C2[Campus: Burnaby]
        C3[Faculty: Medicine & Health Sciences]
        C4[Delivery Mode: Full/Part Time]
    end
    
    subgraph Recognition["Recognition Section"]
        R1[Institutional Approval]
        R2[Transcript Recognition]
        R3[Credit Status]
    end
    
    subgraph Pathways["Pathways Section"]
        P1[Internal Pathways]
        P2[External Pathways]
        P3[New Pathway Suggestions]
    end
    
    Header --> Core
    Core --> Recognition
    Recognition --> Pathways
    
    style Recognition fill:#FFE5E5
    style Pathways fill:#E5F5FF
```

## Recognition Logic Flow

```mermaid
flowchart TD
    Start([Start Recognition Assessment]) --> Q1{Institutional<br/>Approval?}
    
    Q1 -->|Yes| Q2{Credit on<br/>Transcript?}
    Q1 -->|No| E1[Flag: Requires Approval]
    
    Q2 -->|Yes| Q3{Credit<br/>Type?}
    Q2 -->|No| Q4{Digital<br/>Badge?}
    
    Q3 --> |Course Credits| R1[Record: Course Credits]
    Q3 --> |Other| R2[Record: Red Seal/Other]
    
    Q4 -->|Yes| R3[Record: Digital Badge]
    Q4 -->|No| R4[Record: Non-Transcript Recognition]
    
    R1 & R2 & R3 & R4 --> Q5{Recognition<br/>Received?}
    
    Q5 -->|Yes| Complete([Recognition Complete])
    Q5 -->|No| Pending([Pending Recognition])
    
    E1 --> Pending
    
    style Q1 fill:#FFD700
    style Q5 fill:#90EE90
    style Complete fill:#32CD32
```

## Pathways Decision Tree

```mermaid
graph TD
    Root{Evaluate<br/>Pathways} --> Internal{Internal<br/>Pathways<br/>Exist?}
    Root --> External{External<br/>Pathways<br/>Exist?}
    
    Internal -->|Yes| I1[Finance Major, BBA]
    Internal -->|Yes| I2[HR Management Major, BBA]
    Internal -->|Should Exist?| I3[International Business Major]
    
    External -->|Yes| E1[UVic: Global Dev Studies]
    External -->|Yes| E2[SFU: Business Analytics]
    External -->|Should Exist?| E3[New Institution Pathway]
    
    I1 & I2 --> IA[AI: Analyze Fit Score]
    I3 --> IB[AI: Suggest Creation]
    
    E1 & E2 --> EA[AI: Analyze Transfer Credits]
    E3 --> EB[AI: Recommend Partnership]
    
    IA & IB --> Report1[Internal Pathway Report]
    EA & EB --> Report2[External Pathway Report]
    
    Report1 & Report2 --> Final[Comprehensive Pathway Analysis]
    
    style Root fill:#FF6B6B
    style IA fill:#4ECDC4
    style EA fill:#4ECDC4
    style Final fill:#95E1D3
```

## AI Conversation Flow

```mermaid
sequenceDiagram
    participant User
    participant AI_Agent
    participant Validation
    participant Database
    participant Recommendation
    
    User->>AI_Agent: Enter program details
    AI_Agent->>Validation: Validate data completeness
    Validation-->>AI_Agent: Validation result
    
    AI_Agent->>Database: Query similar programs
    Database-->>AI_Agent: Return matches
    
    AI_Agent->>Recommendation: Generate suggestions
    Recommendation-->>AI_Agent: Pathway options
    
    AI_Agent->>User: Present recommendations
    User->>AI_Agent: Confirm selections
    
    AI_Agent->>Database: Save configuration
    Database-->>AI_Agent: Confirmation
    
    AI_Agent->>User: Generate assessment report
    
    Note over User,Recommendation: AI continuously learns from<br/>user interactions to improve<br/>recommendations
```

## Entity Relationship Diagram

```mermaid
erDiagram
    MICRO_CREDENTIAL ||--o{ RECOGNITION : has
    MICRO_CREDENTIAL ||--o{ PATHWAY : contains
    MICRO_CREDENTIAL ||--|| INSTITUTION : belongs_to
    MICRO_CREDENTIAL ||--o{ LEARNING_OUTCOME : defines
    
    RECOGNITION ||--o{ CREDIT_TYPE : includes
    PATHWAY ||--|| PATHWAY_TYPE : is
    PATHWAY }o--|| DESTINATION_PROGRAM : leads_to
    
    MICRO_CREDENTIAL {
        string code PK
        string title
        string campus
        string faculty
        enum status
        int credits
    }
    
    RECOGNITION {
        int id PK
        boolean institutional_approval
        boolean on_transcript
        string credit_reflected
        boolean recognition_received
    }
    
    PATHWAY {
        int id PK
        enum type
        string destination
        boolean exists
        boolean recommended
    }
    
    INSTITUTION {
        int id PK
        string name
        string type
    }
```

## AI Recommendation Engine Logic

```mermaid
flowchart TB
    Input[User Input Data] --> Extract[Extract Key Features]
    Extract --> Vector[Vectorize Features]
    
    Vector --> Match[Pattern Matching]
    Vector --> Analyze[Contextual Analysis]
    
    Match --> DB[(Knowledge Base)]
    Analyze --> ML[ML Model]
    
    DB --> Score1[Similarity Score]
    ML --> Score2[Relevance Score]
    
    Score1 & Score2 --> Combine[Weighted Combination]
    
    Combine --> Filter{Confidence<br/>Threshold?}
    
    Filter -->|High| Recommend[Strong Recommendation]
    Filter -->|Medium| Suggest[Suggestion]
    Filter -->|Low| Flag[Flag for Review]
    
    Recommend --> Present[Present to User]
    Suggest --> Present
    Flag --> Human[Human Review Queue]
    
    Present --> Feedback[Collect User Feedback]
    Feedback --> Learn[Update Model]
    Learn --> ML
    
    style ML fill:#9B59B6
    style Learn fill:#3498DB
    style Present fill:#2ECC71
```

---

## Usage

These diagrams can be rendered in:
- GitHub (natively)
- GitLab (natively)
- VS Code (with Mermaid extension)
- Documentation sites (with Mermaid plugin)
- Notion, Obsidian, and other tools supporting Mermaid

## Updating Diagrams

To update any diagram:
1. Edit the Mermaid code directly in this file
2. Test rendering using [Mermaid Live Editor](https://mermaid.live/)
3. Commit changes to version control

## Additional Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Syntax Reference](https://mermaid.js.org/intro/syntax-reference.html)
- [GitHub Mermaid Support](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/)

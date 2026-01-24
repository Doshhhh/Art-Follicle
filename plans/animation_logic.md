graph TD
    subgraph "Next Button Clicked"
        A[Active Image] -->|Slide Right| B[Exit Screen]
        C[Next Image] -->|Move to Front| A
        D[Third Image] -->|Move up| C
        B -->|Move to Back| D
    end
    
    subgraph "Visual Stack"
        S1[Front: Current Page]
        S2[Middle: Next Page - offset left]
        S3[Back: Third Page - offset left more]
    end

# Models

## What are models?
In this project `models` refer to *database* models, specifically schemas for Sequelize.

## Why are they so ugly and verbose?
Because Sequelize says so. I do not like it, but I'm not about to rewrite it with something else before I'm done with everything else.  
For more information, refer to the [Sequelize TypeScript documentation](https://sequelize.org/docs/v6/other-topics/typescript/).

## Where are the table names set?
The table names are set within the `Database` class at `initializeModels()` within [src/db.ts](../src/db.ts)  
This is to allow multiple tables to use the same schema. Mostly for dev purposes
```ts
function initializeModels(): void {
    const models = [
        { model: WoWReviewHistory, tableName: 'WoWReviewHistory_PVP' },
        { model: WoWReviewHistory, tableName: 'WoWReviewHistory_PVE' },
        { model: WoWCharacters, tableName: 'WoWCharacters' },
        { model: VerificationLogs, tableName: 'VerificationLogs' },
        { model: VerifiedUsers, tableName: 'VerifiedUsers' }
    ]
    models.forEach(({ model, tableName }) => {
        model.initModel(db, tableName)
        model.sync()
    })
}
```
There are better ways but as of now this was the simplest. Can be updated later.
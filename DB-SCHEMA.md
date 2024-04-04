# Database Schema Docs

## Countries Table 

| Column Name | Data Types | Description   |
|------------------------------------------|
| id          | string     | Unique id for the country          
| name        | string     | Name of country

## Players Table

| Column Name | Data Types | Description   |
|------------------------------------------|
| id          | string     | id for player          
| country_name| string     | Name of country
| number      | int        | Player's number          
| position    | string     | Player's position
| country_id  | string     | Forgein key to countries table     

## Records Table

| Column Name | Data Types | Description   |
|------------------------------------------|
| id          | string     | id for the record            
| year        | int        | year of the record 
| country_id  | string     | id of the country, linked to Countries table          
| winner      | boolean    | Indicate if the country was the winner for that year

## Relationships 

- Each 'country' can have mulitple 'players'.
- A 'winner' is only associated with one country within that year.  


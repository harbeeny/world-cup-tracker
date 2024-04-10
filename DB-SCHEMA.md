# Database Schema Docs

## Countries Table 

| Column Name | Data Types | Description   |
|------------------------------------------|
| id    (PK)  | string     | Unique id for the country    
| name        | string     | Name of country     

constraints:
-UNIQUE name
-ID is === 3 letters 
-name NOT NULL

## Years Table 

| Column Name | Data Types | Description   |
|------------------------------------------|
| id (PK) (serial) | integer |
| year     | integer  |         
<!-- | winner_country_id (FK)  | string     | Forgein Key, references country.id to denote the winner of that year -->

constraints:
-year == 4 numbers
-UNIQUE year
-year NOT NULL

## Players Table

| Column Name | Data Types | Description   |
|------------------------------------------|
| id (PK) (serial) | integer    | Unique id for player          
| name        | string     | Name of player 
| number      | integer    | Player's number          
| position    | string     | Player's position
| country_id (FK)   | string     | references countries.id    
| year_id (FK)   | integer     | references years.id    

constraints:
-UNIQUE number, country_id, year_id
-name, number, position, country_id, year_id NOT NULL

Relationship: 
Player belongs to country 
Player belongs to year 
 

## Records Table

| Column Name | Data Types | Description   |
|------------------------------------------|
| id   (PK)  (serial)     | int    | id for the record            
| year_id     | int        | year of the record 
| country_id  | string     | id of the country, linked to Countries table          
| winner      | boolean    | Indicate if the country was the winner for that year

constraints:
-UNIQUE year_id, country_id
-UNIQUE winner, year_id
-year_id, country_id, winner NOT NULL

Relationship:
Record belongs to year 
Record belongs to country 


## Relationships 

- Each 'country' can have mulitple 'players'.
- A 'winner' is only associated with one country within that year.  


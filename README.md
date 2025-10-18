# USThing Backend Technical Test 2025

This is my submission for the USThing Backend Technical Test(2025).  
This project is mainly made with Nest and Prisma. It is intended to be scalable.

## API Routes

### GET /competitions

Returns a list of competitions. Supports filtering and pagination.

| Query param    | Type   | Required | Description                                                                                 |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| isCreatedAfter | string | No       | Return competitions created after this ISO date (exclusive, format must be in `YYYY-MM-DD`) |
| limit          | string | No       | Maximum number of records to return                                                         |
| source         | string | No       | Filter by competition source                                                                |
| keyword        | string | No       | Filter competitions whose title contains this keyword                                       |

**Sample Response:**

```json
[
  {
    "id": "cmgwe95o90005si64o48al8cf",
    "externalId": null,
    "title": "CFA Institute Research Challenge 2025-26",
    "url": "https://polyuit-my.sharepoint.com/:b:/g/personal/icaki_polyu_edu_hk/ESojFzxCf01IglbOIxXZgMMBl1BRESQO4zEIj-5H1YEpbA?e=kBEh9X",
    "source": "PolyU",
    "createdAt": "2025-10-18T14:49:47.001Z",
    "updatedAt": "2025-10-18T14:49:47.001Z"
  },
  ...
]
```

---

### GET /competitions/:id

Returns a single competition by its ID.

| Path Parameter | Type   | Required | Description    |
| -------------- | ------ | -------- | -------------- |
| id             | string | Yes      | Competition ID |

**Sample Response:**

```json
{
    "id": "cmgwe95o90005si64o48al8cf",
    "externalId": null,
    "title": "CFA Institute Research Challenge 2025-26",
    "url": "https://polyuit-my.sharepoint.com/:b:/g/personal/icaki_polyu_edu_hk/ESojFzxCf01IglbOIxXZgMMBl1BRESQO4zEIj-5H1YEpbA?e=kBEh9X",
    "source": "PolyU",
    "createdAt": "2025-10-18T14:49:47.001Z",
    "updatedAt": "2025-10-18T14:49:47.001Z"
}
```

**Error Responses:**

- `404`: If the competition does not exist

---

### GET /scraper/competitions

Triggers scraping of competitions and store the scraped results into the database. The scraped data is returned. 


**Throttling:** Max 3 requests per 20 seconds per client.

**Response:**

```json
[
  {
    "externalId": "the-fourth-kpmg-esg-case-study-competition",
    "title": "The Fourth KPMG ESG Case Study...",
    "url": "https://ug.hkubs.hku.hk/competition/the-fourth-kpmg-esg-case-study-competition",
    "source": "HKU",
    "normalizedTitle": "the fourth kpmg esg case study"
  },
  ...
]
```

**Error Responses:**

- `429`: Rate limit exceeded

# USThing Backend Technical Test 2025

This is my submission for the USThing Backend Technical Test(2025).  
This project is mainly made with Nest and Prisma. It is intended to be scalable.

## Docker

### **Important: Please create the `.env` file first. See the following example:**

_Alternatively, you may run `mv .env.template .env`._

```sh
# .env
DATABASE_URL="file:./dev.db"
DATABASE_USER=test
DATABASE_PASSWORD=test
```

### Build and start the container

```bash
docker compose up -d
```

The service runs on port `3000` by default.

## API Routes

### GET /competitions

Returns a list of competitions. Supports filtering and pagination.
This data comes from the database which stores previous scraped records.

| Query param    | Type   | Required | Description                                                                                 |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| isCreatedAfter | string | No       | Return competitions created after this ISO date (exclusive, format must be in `YYYY-MM-DD`) |
| limit          | string | No       | Maximum number of records to return                                                         |
| source         | string | No       | Filter by competition source                                                                |
| keyword        | string | No       | Filter competitions whose title contains this keyword                                       |

**Sample Response:**  
Status code: `200 OK`

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

| Path param | Type   | Required | Description    |
| ---------- | ------ | -------- | -------------- |
| id         | string | Yes      | Competition ID |

**Sample Response:**  
Status code: `200 OK`

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

### POST /scraper

Triggers scraping of competitions and optionally store the scraped results into the database. The scraped data is returned.

**Throttling:** Max 3 requests per 20 seconds per client.

| Body field | Type           | Required | Description                                                                                                                |
| ---------- | -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| action     | "run"\|"sync"  | Yes      | "run" scrapes the sources and return scraped data, "sync" scrapes the sources, update the database and return scraped data |
| sources    | _sourceName_[] | No       | Optional array of source names to filter which extractors to use, where _sourceName_ is one of "hku", "hkust" or "polyu"   |

**Sample Response:**  
Status code: `200 OK`

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

- `400`: Invalid request body (e.g., missing action, invalid action value, or invalid source names)
- `429`: Rate limit exceeded

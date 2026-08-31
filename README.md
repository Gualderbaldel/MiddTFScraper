# MiddTFScraper

This is a weekly newsletter for the Middlebury men's sprint group. It takes data from TFFRS and displays it, as well as holding it in a database so that you can see changes in data.
## TFRRS information that this program displays:
-DIII rankings

-NE rankings

-athlete PR's

-school records

## Novel innovation that this program generates:
-PR improvement

-NESCAC ranking 

-Ranking changes

## Utility of NESCAC rankings
In the indoor season, the conference doesn't exist. Fortunately, we are able to calculate NESCAC rankings from NE rankings. However, there is a small caveat: Hamilton's fuck-ass school is not in DIII NE, so we have to account for that by individually scraping their data and merging it with our DIII rankings. What we get are accurate NESCAC rankings in the winter.

# Tools
The program was made with MS Playwright for scraping and Supabase for persistent storage. Also, MS Graph api for automatic emailing.

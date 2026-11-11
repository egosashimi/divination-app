// name|lat|lon for relocation readings
export const CITIES = `London|51.51|-0.13
Paris|48.86|2.35
Berlin|52.52|13.40
Madrid|40.42|-3.70
Lisbon|38.72|-9.14
Rome|41.90|12.50
Athens|37.98|23.73
Istanbul|41.01|28.98
Moscow|55.76|37.62
Stockholm|59.33|18.07
Oslo|59.91|10.75
Copenhagen|55.68|12.57
Helsinki|60.17|24.94
Dublin|53.35|-6.26
Edinburgh|55.95|-3.19
Amsterdam|52.37|4.90
Brussels|50.85|4.35
Zurich|47.38|8.54
Vienna|48.21|16.37
Prague|50.08|14.44
Warsaw|52.23|21.01
Budapest|47.50|19.04
Reykjavik|64.15|-21.94
Cairo|30.04|31.24
Marrakesh|31.63|-8.01
Lagos|6.52|3.38
Accra|5.60|-0.19
Nairobi|-1.29|36.82
Addis Ababa|9.03|38.74
Johannesburg|-26.20|28.05
Cape Town|-33.92|18.42
Dubai|25.20|55.27
Tel Aviv|32.09|34.78
Tehran|35.69|51.39
Riyadh|24.71|46.68
Mumbai|19.08|72.88
Delhi|28.61|77.21
Bangalore|12.97|77.59
Kolkata|22.57|88.36
Kathmandu|27.72|85.32
Colombo|6.93|79.86
Bangkok|13.76|100.50
Hanoi|21.03|105.85
Singapore|1.35|103.82
Kuala Lumpur|3.14|101.69
Jakarta|-6.21|106.85
Bali|-8.65|115.22
Manila|14.60|120.98
Hong Kong|22.32|114.17
Shanghai|31.23|121.47
Beijing|39.90|116.41
Taipei|25.03|121.57
Seoul|37.57|126.98
Tokyo|35.68|139.69
Osaka|34.69|135.50
Sydney|-33.87|151.21
Melbourne|-37.81|144.96
Brisbane|-27.47|153.03
Perth|-31.95|115.86
Auckland|-36.85|174.76
Honolulu|21.31|-157.86
Anchorage|61.22|-149.90
Vancouver|49.28|-123.12
Seattle|47.61|-122.33
San Francisco|37.77|-122.42
Los Angeles|34.05|-118.24
San Diego|32.72|-117.16
Las Vegas|36.17|-115.14
Phoenix|33.45|-112.07
Denver|39.74|-104.99
Austin|30.27|-97.74
Dallas|32.78|-96.80
Houston|29.76|-95.37
Chicago|41.88|-87.63
Minneapolis|44.98|-93.27
New Orleans|29.95|-90.07
Nashville|36.16|-86.78
Atlanta|33.75|-84.39
Miami|25.76|-80.19
Washington DC|38.91|-77.04
Philadelphia|39.95|-75.17
New York|40.71|-74.01
Boston|42.36|-71.06
Toronto|43.65|-79.38
Montreal|45.50|-73.57
Mexico City|19.43|-99.13
Havana|23.11|-82.37
Bogota|4.71|-74.07
Lima|-12.05|-77.04
Quito|-0.18|-78.47
Santiago|-33.45|-70.67
Buenos Aires|-34.60|-58.38
Sao Paulo|-23.55|-46.63
Rio de Janeiro|-22.91|-43.17`.split('\n').map((l) => { const [name, lat, lon] = l.split('|'); return { name, lat: +lat, lon: +lon }; });

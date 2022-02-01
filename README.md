# tsetmc
run tsetmc filters at the highest speed


## Installation
* git clone https://github.com/IRMilad/tsetmc.git
* docker-compose up --build


## python Example

```
import requests

def tsetmc(filters, check=False, settings={}):
    data = {
        'filters': filters,
        'settings': settings,
        'checkFilter': check
    }
    with requests.post('http://localhost:8080/Getdata', json=data) as result:
        return result.json()

result = tsetmc(['(pl) > 1000 && (pc) > 1000'], settings={
    'UpdateSpeed':           1000,
    'ColorChangeSpeed':      7000,
    'ColorChangeEnable':     1,
    'ViewMode':              1,
    'Market':                0,
    'BasketNo':              -1,
    'FilterNo':              -1,
    'SectorNo':              '',
    'sortField':             'tno',
    'sortDirection':         -1,
    'ActiveTemplate':        2,
    'Baskets':               [],
    'Filters':               [],
    'GroupBySector':         1,
    'LightBackground':       1,
    'BigNumberSymbol':       1,
    'ShowHousingFacilities': 1,
    'ShowSaham':             1,
    'ShowPayeFarabourse':    0,
    'ShowHaghTaghaddom':     1,
    'ShowOraghMosharekat':   1,
    'ShowEkhtiarForoush':    1,
    'ShowAti':               1,
    'ShowSandoogh':          1,
    'ShowKala':              1,
    'AutoScroll':            0,
    'LoadClientType':        0,
    'LoadInstStat':          0,
    'LoadInstHistory':       0,
    'CustomTemplate':        {
          'colNo':     10,
          'fontSize':  12,
          'rowHeight': 20,
          'cols':      [],
          'all':       '',
          'rowStyle':  '',
          'row':       ''
        }
    }
)
print(result)
```

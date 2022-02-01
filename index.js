#!/usr/local/bin/node

const cluster = require('cluster');

const FIELDS = {
  l18:  0, // نماد
  l30:  1, // نام
  tno:  2, // تعداد
  tvol: 3, // حجم
  tval: 4, // ارزش
  py:   5, // قیمت دیروز
  pf:   6, // اولین قیمت
  pmin: 13, // کمترین قیمت
  pmax: 14, // بیشترین قیمت
  pl:   7, // آخرین قیمت
  plc:  8, // تغییر اخرین قیمت
  plp:  9, // درصد تغییر اخرین قیمت
  pc:   10, // قیمت پایانی
  pcc:  11, // تغییر قیمت پایانی
  pcp:  12, // درصد تغییر قیمت پایانی
  eps:  15, // eps
  pe:   16, // P/E
  pd1:  19, // قیمت خرید
  zd1:  17, // تعداد خرید
  qd1:  18, // حجم خرید
  po1:  20, // قیمت فروش
  zo1:  22, // تعداد فروش
  qo1:  21, // حجم فروش
  /* visitcount: 'تعداد بازدید - پربیننده',
   heven:      'زمان آخرین معامله',
   mv:         'تعداد سهام',
   cfield0:    'cfield0',
   cfield1:    'cfield1',
   cfield2:    'cfield2',*/
};
const FIELDS_ALT = {
  l18:  'symbol', // نماد
  l30:  'name', // نام
  tno:  'count', // تعداد
  tvol: 'volume', // حجم
  tval: 'value', // ارزش
  py:   'priceYesterday', // قیمت دیروز
  pf:   'priceFirst', // اولین قیمت
  pmin: 'priceMin', // کمترین قیمت
  pmax: 'priceMax', // بیشترین قیمت
  pl:   'priceLast', // آخرین قیمت
  plc:  'priceLastChange', // تغییر اخرین قیمت
  plp:  'priceLastPercent', // درصد تغییر اخرین قیمت
  pc:   'priceCurrent', // قیمت پایانی
  pcc:  'priceCurrentChange', // تغییر قیمت پایانی
  pcp:  'priceCurrentPercent', // درصد تغییر قیمت پایانی
  eps:  'EPS', // eps
  pe:   'PE', // P/E
  pd1:  'priceBuy', // قیمت خرید
  zd1:  'countBuy', // تعداد خرید
  qd1:  'volumeBuy', // حجم خرید
  po1:  'priceSell', // قیمت فروش
  zo1:  'countSell', // تعداد فروش
  qo1:  'volumeSell', // حجم فروش
  /* visitcount: 'تعداد بازدید - پربیننده',
   heven:      'زمان آخرین معامله',
   mv:         'تعداد سهام',
   cfield0:    'cfield0',
   cfield1:    'cfield1',
   cfield2:    'cfield2',*/
};
var Sectors = [
  ['01', 'زراعت و خدمات وابسته'],
  ['02', 'جنگلداري و ماهيگيري'],
  ['10', 'استخراج زغال سنگ'],
  ['11', 'استخراج نفت گاز و خدمات جنبي جز اکتشاف'],
  ['13', 'استخراج کانه هاي فلزي'],
  ['14', 'استخراج ساير معادن'],
  ['15', 'حذف شده- فرآورده‌هاي غذايي و آشاميدني'],
  ['17', 'منسوجات'],
  ['19', 'دباغي، پرداخت چرم و ساخت انواع پاپوش'],
  ['20', 'محصولات چوبي'],
  ['21', 'محصولات كاغذي'],
  ['22', 'انتشار، چاپ و تکثير'],
  ['23', 'فراورده هاي نفتي، كك و سوخت هسته اي'],
  ['24', 'حذف شده-مواد و محصولات شيميايي'],
  ['25', 'لاستيك و پلاستيك'],
  ['26', 'توليد محصولات كامپيوتري الكترونيكي ونوري'],
  ['27', 'فلزات اساسي'],
  ['28', 'ساخت محصولات فلزي'],
  ['29', 'ماشين آلات و تجهيزات'],
  ['31', 'ماشين آلات و دستگاه‌هاي برقي'],
  ['32', 'ساخت دستگاه‌ها و وسايل ارتباطي'],
  ['33', 'ابزارپزشکي، اپتيکي و اندازه‌گيري'],
  ['34', 'خودرو و ساخت قطعات'],
  ['35', 'ساير تجهيزات حمل و نقل'],
  ['36', 'مبلمان و مصنوعات ديگر'],
  ['38', 'قند و شكر'],
  ['39', 'شرکتهاي چند رشته اي صنعتي'],
  ['40', 'عرضه برق، گاز، بخاروآب گرم'],
  ['41', 'جمع آوري، تصفيه و توزيع آب'],
  ['42', 'محصولات غذايي و آشاميدني به جز قند و شكر'],
  ['43', 'مواد و محصولات دارويي'],
  ['44', 'محصولات شيميايي'],
  ['45', 'پيمانكاري صنعتي'],
  ['46', 'تجارت عمده فروشي به جز وسايل نقليه موتور'],
  ['47', 'خرده فروشي،باستثناي وسايل نقليه موتوري'],
  ['49', 'كاشي و سراميك'],
  ['50', 'تجارت عمده وخرده فروشي وسائط نقليه موتور'],
  ['51', 'حمل و نقل هوايي'],
  ['52', 'انبارداري و حمايت از فعاليتهاي حمل و نقل'],
  ['53', 'سيمان، آهك و گچ'],
  ['54', 'ساير محصولات كاني غيرفلزي'],
  ['55', 'هتل و رستوران'],
  ['56', 'سرمايه گذاريها'],
  ['57', 'بانكها و موسسات اعتباري'],
  ['58', 'ساير واسطه گريهاي مالي'],
  ['59', 'اوراق حق تقدم استفاده از تسهيلات مسكن'],
  ['60', 'حمل ونقل، انبارداري و ارتباطات'],
  ['61', 'حمل و نقل آبي'],
  ['63', 'فعاليت هاي پشتيباني و كمكي حمل و نقل'],
  ['64', 'مخابرات'],
  ['65', 'واسطه‌گري‌هاي مالي و پولي'],
  ['66', 'بيمه وصندوق بازنشستگي به جزتامين اجتماعي'],
  ['67', 'فعاليتهاي كمكي به نهادهاي مالي واسط'],
  ['68', 'صندوق سرمايه گذاري قابل معامله'],
  ['69', 'اوراق تامين مالي'],
  ['70', 'انبوه سازي، املاك و مستغلات'],
  ['71', 'فعاليت مهندسي، تجزيه، تحليل و آزمايش فني'],
  ['72', 'رايانه و فعاليت‌هاي وابسته به آن'],
  ['73', 'اطلاعات و ارتباطات'],
  ['74', 'خدمات فني و مهندسي'],
  ['76', 'اوراق بهادار مبتني بر دارايي فكري'],
  ['77', 'فعالبت هاي اجاره و ليزينگ'],
  ['82', 'فعاليت پشتيباني اجرائي اداري وحمايت كسب'],
  ['90', 'فعاليت هاي هنري، سرگرمي و خلاقانه'],
  ['93', 'فعاليتهاي فرهنگي و ورزشي'],
  ['98', 'گروه اوراق غيرفعال'],
  ['X1', 'شاخص'],
];

const sleep = (sec) => new Promise(resolve => setTimeout(resolve, sec * 1000));
const IORedis = require('ioredis');
const RedisCli = new IORedis({host: 'redis'});
let mw = {
  ClientType:      {},
  InstStat:        {},
  InstHistory:     {},
  Settings:        {},
  BasketInsts:     '',
  DefaultSettings: {
    UpdateSpeed:           1000,
    ColorChangeSpeed:      7000,
    ColorChangeEnable:     1,
    ViewMode:              1,
    Market:                0,
    BasketNo:              -1,
    FilterNo:              -1,
    SectorNo:              '',
    sortField:             'tno',
    sortDirection:         -1,
    ActiveTemplate:        2,
    Baskets:               [],
    Filters:               [],
    GroupBySector:         1,
    LightBackground:       1,
    BigNumberSymbol:       1,
    ShowHousingFacilities: 1,
    ShowSaham:             1,
    ShowPayeFarabourse:    0,
    ShowHaghTaghaddom:     1,
    ShowOraghMosharekat:   1,
    ShowEkhtiarForoush:    1,
    ShowAti:               1,
    ShowSandoogh:          1,
    ShowKala:              1,
    AutoScroll:            0,
    LoadClientType:        0,
    LoadInstStat:          0,
    LoadInstHistory:       0,
    CustomTemplate:        {
      colNo:     10,
      fontSize:  12,
      rowHeight: 20,
      cols:      [],
      all:       '',
      rowStyle:  '',
      row:       '',
    },
  },
};
let AllRows = {};

const getSectorName = function(SectorCode) {
  for (var ipos = 0; ipos < Sectors.length; ipos++) {
    if (SectorCode == Sectors[ipos][0]) {
      return Sectors[ipos][1];
    }
  }
  return 'NoCat';
};
if (cluster.isMaster) {
  let cpus = require('os').cpus().length;
  console.log('Cpu count %s', cpus);
  let timeouts = {};
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
  const fetch = require('node-fetch').default;
  process.on('SIGINT', function() {
    console.log('God bye');
    process.exit();
  });
  let RoundNo = 0;
  let heven = 0;
  let refid = 0;
  let reqCount = 0;
  const UPDATE_INTERVAL = 1000;
  function AdvRound(b, a) {return Math.round(b * Math.pow(10, a)) / Math.pow(10, a);}
  function AddDataToStore(RowID, data) {
    if (typeof AllRows[RowID] == 'undefined') {return;}
    for (var key in data) {
      if (AllRows[RowID][key] == data[key]) {
        AllRows[RowID]['_' + key] = '0';
      }else {
        AllRows[RowID]['_' + key] = '' + RoundNo;
      }
      AllRows[RowID][key] = data[key];
    }
  }
  function AddNewRowToStore(RowID, data) {
    if (typeof AllRows[RowID] == 'undefined') {AllRows[RowID] = data;}
  }
  async function initGroups() {
    if (timeouts.initGp) {
      clearTimeout(timeouts.initGp);
    }
    try {
      let data = await fetch('http://www.tsetmc.com/tsev2/res/loader.aspx?t=g&_469').then(body => body.text());
      if (data.startsWith('var Sectors')) {
        //  console.log(data);
        eval(data.replace('var', ''));
      }
    }catch (e) {

      timeouts.initGp = setTimeout(initGroups, 1000);
    }

  }

  async function LoadClientType() {
    if (timeouts.loadClType) {
      clearTimeout(timeouts.loadClType);
    }
    let data;

    try {
      data = await fetch('http://www.tsetmc.com/tsev2/data/ClientTypeAll.aspx').then(body => body.text());

      if (data.length == 0) {return;}
      var rows = data.split(';');
      var cols;
      var jd;
      for (var qpos = 0; qpos < rows.length; qpos++) {
        cols = rows[qpos].split(',');
        jd = {
          Buy_CountI:    parseInt(cols[1], 10),
          Buy_CountN:    parseInt(cols[2], 10),
          Buy_I_Volume:  parseInt(cols[3], 10),
          Buy_N_Volume:  parseInt(cols[4], 10),
          Sell_CountI:   parseInt(cols[5], 10),
          Sell_CountN:   parseInt(cols[6], 10),
          Sell_I_Volume: parseInt(cols[7], 10),
          Sell_N_Volume: parseInt(cols[8], 10),
        };
        mw.ClientType[cols[0]] = jd;
      }
    }catch (e) {
      timeouts.loadClType = setTimeout(LoadClientType, 6000);
      return;
    }
    timeouts.loadClType = setTimeout(LoadClientType, 60000);

  }
  async function LoadInstStat() {
    if (timeouts.loadInsStat) {
      clearTimeout(timeouts.loadInsStat);
    }
    let data;
    try {
      data = await fetch('http://www.tsetmc.com/tsev2/data/InstValue.aspx?t=a').then(body => body.text());

      var InsCode = '';
      var rows = data.split(';');
      var cols;
      var jd;
      for (var qpos = 0; qpos < rows.length; qpos++) {
        cols = rows[qpos].split(',');
        if (cols.length == 3) {
          InsCode = cols[0];
          if (typeof mw.InstStat[InsCode] == 'undefined') {mw.InstStat[InsCode] = {};}
          mw.InstStat[InsCode][cols[1]] = parseFloat(cols[2]);
        }else {
          if (typeof mw.InstStat[InsCode] == 'undefined') {mw.InstStat[InsCode] = {};}
          mw.InstStat[InsCode][cols[0]] = parseFloat(cols[1]);
        }
      }
    }catch (e) {
      timeouts.loadInsStat = setTimeout(LoadInstStat, 1000);
    }
    // console.log(mw.InstStat);

  }
  async function LoadInstHistory() {
    let data;
    if (timeouts.loadInstH) {
      clearTimeout(timeouts.loadInstH);
    }
    try {
      data = await fetch('http://members.tsetmc.com/tsev2/data/ClosingPriceAll.aspx', {
        headers: {Cookie: 'REPLACE IT'},
      }).then(body => body.text());

      var InsCode = '';
      var rows = data.split(';');
      var cols;
      var jd;
      var offset;
      var days;
      for (var qpos = 0; qpos < rows.length; qpos++) {
        cols = rows[qpos].split(',');
        if (cols.length == 11) {
          InsCode = cols[0];
          offset = 1;
        }else {offset = 0;}
        days = parseInt(cols[offset], 10);
        if (typeof mw.InstHistory[InsCode] == 'undefined') {mw.InstHistory[InsCode] = [];}
        mw.InstHistory[InsCode][days] = {
          PClosing:       parseFloat(cols[offset + 1]),
          PDrCotVal:      parseFloat(cols[offset + 2]),
          ZTotTran:       parseFloat(cols[offset + 3]),
          QTotTran5J:     parseFloat(cols[offset + 4]),
          QTotCap:        parseFloat(cols[offset + 5]),
          PriceMin:       parseFloat(cols[offset + 6]),
          PriceMax:       parseFloat(cols[offset + 7]),
          PriceYesterday: parseFloat(cols[offset + 8]),
          PriceFirst:     parseFloat(cols[offset + 9]),
        };
      }

    }catch (e) {
      console.log(e);
      timeouts.loadInstH = setTimeout(LoadInstHistory, 1000);
      return;
    }
  }

  async function updateData() {
    if (timeouts.loadData) {
      clearTimeout(timeouts.loadData);
    }
    let h = 5 * Math.floor(heven / 5), r = 25 * Math.floor(refid / 25);
    let sData;
    try {
      sData = await fetch(`http://www.tsetmc.com/${ heven == 0?
          'tsev2/data/MarketWatchInit.aspx':
          'tsev2/data/MarketWatchPlus.aspx' }?h=${ h }&r=${ r }`).
          then(body => body.text());
    }catch (e) {
      timeouts.loadData = setTimeout(updateData, 1000);
      return;
    }

    if (++RoundNo > 8) {
      RoundNo = 1;
    }
    let all = sData.split('@');
    if (all.length < 5) {
      timeouts.loadData = setTimeout(updateData, 1000);
      return;
    }

    reqCount++;
    if (reqCount % 100 === 0) {
      console.log({refreshCount: reqCount});
    }
    let InstPrice = all[2].split(';');
    for (let ipos = 0; ipos < InstPrice.length; ipos++) {
      var col = InstPrice[ipos].split(',');
      var RowID = col[0];
      if (col.length == 10) {
        if (AllRows[RowID] !== undefined) {
          var py = parseInt(AllRows[RowID]['py']);
          var eps = AllRows[RowID]['eps'];
          AddDataToStore(RowID, {
            heven:   col[1],
            pf:      col[2],
            pc:      col[3],
            pcc:     '' + parseInt(col[3]) - py,
            pcp:     '' + AdvRound(100 * (parseInt(col[3]) - py) / py, 2),
            pl:      col[4],
            plc:     col[5] == '0'?'0':'' + parseInt(col[4]) - py,
            plp:     col[5] == '0'?'0':'' + AdvRound(100 * (parseInt(col[4]) - py) / py, 2),
            tno:     col[5],
            tvol:    col[6],
            tval:    col[7],
            pmin:    col[8],
            pmax:    col[9],
            pe:      eps == ''?'':AdvRound(parseInt(col[4]) / parseInt(eps), 2),
            render:  '',
            preview: '',
          });
          if (heven < parseInt(col[1])) {heven = parseInt(col[1]);}
        }
      }else {
        AddNewRowToStore(RowID, {
          inscode:    col[0],
          iid:        col[1],
          l18:        col[2],
          l30:        col[3],
          py:         col[13],
          bvol:       col[15],
          visitcount: col[16],
          flow:       col[17],
          cs:         col[18],
          tmax:       col[19],
          tmin:       col[20],
          z:          col[21],
          yval:       col[22],
          zo1:        '',
          zd1:        '',
          pd1:        '',
          po1:        '',
          qd1:        '',
          qo1:        '',
          _zo1:       '',
          _zd1:       '',
          _pd1:       '',
          _po1:       '',
          _qd1:       '',
          _qo1:       '',
          zo2:        '',
          zd2:        '',
          pd2:        '',
          po2:        '',
          qd2:        '',
          qo2:        '',
          _zo2:       '',
          _zd2:       '',
          _pd2:       '',
          _po2:       '',
          _qd2:       '',
          _qo2:       '',
          zo3:        '',
          zd3:        '',
          pd3:        '',
          po3:        '',
          qd3:        '',
          qo3:        '',
          _zo3:       '',
          _zd3:       '',
          _pd3:       '',
          _po3:       '',
          _qd3:       '',
          _qo3:       '',
          render:     '',
          preview:    '',
          cfield0:    '',
          cfield1:    '',
          cfield2:    '',
        });
        AddDataToStore(RowID, {
          heven: col[4],
          pf:    col[5],
          pc:    col[6],
          pcc:   '' + parseInt(col[6]) - parseInt(col[13]),
          pcp:   '' + AdvRound(100 * (parseInt(col[6]) - parseInt(col[13])) / parseInt(col[13]), 2),
          pl:    col[7],
          plc:   col[8] == '0'?'0':'' + parseInt(col[7]) - parseInt(col[13]),
          plp:   col[8] == '0'?'0':'' + AdvRound(100 * (parseInt(col[7]) - parseInt(col[13])) / parseInt(col[13]), 2),
          tno:   col[8],
          tvol:  col[9],
          tval:  col[10],
          pmin:  col[11],
          pmax:  col[12],
          eps:   col[14],
          pe:    col[14] == ''?'':AdvRound(parseInt(col[6]) / parseInt(col[14]), 2),
        });
        if (heven < parseInt(col[4])) {heven = parseInt(col[4]);}
      }
    }

    var BestLimit = all[3].split(';');
    for (let ipos = 0; ipos < BestLimit.length; ipos++) {
      var col = BestLimit[ipos].split(',');
      var RowID = col[0];
      if (typeof AllRows[RowID] == 'undefined') {continue;}
      var data;
      switch (col[1]) {
        case'1':
          data = {
            zo1:     col[2],
            zd1:     col[3],
            pd1:     col[4],
            po1:     col[5],
            qd1:     col[6],
            qo1:     col[7],
            render:  '',
            preview: '',
          };
          break;
        case'2':
          data = {
            zo2:     col[2],
            zd2:     col[3],
            pd2:     col[4],
            po2:     col[5],
            qd2:     col[6],
            qo2:     col[7],
            render:  '',
            preview: '',
          };
          break;
        case'3':
          data = {
            zo3:     col[2],
            zd3:     col[3],
            pd3:     col[4],
            po3:     col[5],
            qd3:     col[6],
            qo3:     col[7],
            render:  '',
            preview: '',
          };
          break;
      }
      AddDataToStore(RowID, data);
    }
    if (all[4] != '0' && parseInt(all[4]) > refid) {refid = parseInt(all[4]);}
    timeouts.loadData = setTimeout(updateData, 1000);
  }
  let isLoaded = false;
  setTimeout(async() => {
    await initGroups();
    await updateData();
    await LoadClientType();
    await LoadInstHistory();
    await LoadInstStat();
    isLoaded = true;
  }, 1000);
  setInterval(async() => {
    if (isLoaded) {
      await RedisCli.set('mw', JSON.stringify(mw));
      await RedisCli.set('rows', JSON.stringify(AllRows));
    }
  }, 1000);

  setInterval(() => {
    heven = 0;
    RoundNo = 0;
    refid = 0;
    reqCount = 0;
  }, 2 * 60 * 60000);
}else {
  const app = require('express')();
  console.log('started cluster...');
  const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  const {Script} = require('vm');

  async function getRows(filters, fields, Settings) {
    let ids = Object.keys(AllRows);
    if (!Settings) {
      Settings = Object.assign({}, mw.DefaultSettings);
    }else {
      Settings = Object.assign({}, mw.DefaultSettings, Settings);
    }
    fields = fields || FIELDS;
    let out = {};
    console.log({ids});
    if (ids.length === 0) {
      await sleep(1);
      return getRows(filters, fields, Settings);
    }
    let vmScripts = filters.map(code => new Script(filterCode(code)));
    for (let key in AllRows) {
      if (!AllRows.hasOwnProperty(key)) {continue;}
      let row = AllRows[key];
      if (!row.l18) continue;
      if (Settings.ViewMode == 1 && row.tno == '0') {continue;}
      if (Settings.ViewMode == 2 && mw.BasketInsts.indexOf(row.inscode) == -1) {continue;}
      if (Settings.ViewMode == 3 && Settings.SectorNo != row.cs) {continue;}
      let flow = row.flow;
      if (Settings.Market == 1 && (flow != '1' && flow != '3')) {continue;}
      if (Settings.Market == 2 && (flow == '1' || flow == '3')) {continue;}
      if (Settings.ShowHousingFacilities == 0) {
        if (row.l18.indexOf('تسه') == 0 || row.l18.indexOf('تملي') == 0) {continue;}
      }
      let yval = row.yval;
      if (Settings.ShowSaham == 0 && (yval == '300' || yval == '303' || yval == '313') && row.l18.indexOf('تسه') !=
          0) {continue;}
      if (Settings.ShowPayeFarabourse == 0 && (yval == '309')) {continue;}
      if (Settings.ShowHaghTaghaddom == 0 && (yval == '400' || yval == '403' || yval == '404')) {continue;}
      if (Settings.ShowOraghMosharekat == 0 &&
          (yval == '306' || yval == '301' || yval == '706' || yval == '208')) {continue;}
      if (Settings.ShowAti == 0 && (yval == '263')) {continue;}
      if (Settings.ShowSandoogh == 0 && (yval == '305' || yval == '380')) {continue;}
      if (Settings.ShowEkhtiarForoush == 0 &&
          (yval == '600' || yval == '602' || yval == '605' || yval == '311' || yval == '312')) {continue;}
      if (Settings.ShowKala == 0 && (yval == '308' || yval == '701')) {continue;}
      let add = true;
      if (vmScripts.length) {
        for (let vmScript of vmScripts) {

          try {
            if (typeof mw.ClientType[row.inscode] == 'undefined') {
              mw.ClientType[row.inscode] = {
                Buy_CountI:    0,
                Buy_CountN:    0,
                Buy_I_Volume:  0,
                Buy_N_Volume:  0,
                Sell_CountI:   0,
                Sell_CountN:   0,
                Sell_I_Volume: 0,
                Sell_N_Volume: 0,
              };
            }
            let res = vmScript.runInNewContext({
              row,
              mw,
            }, {timeout: 5000});
            if (!res) {
              add = false;
              break;
            }
          }catch (e) {
            // console.log(e);
            add = false;
            // throw new Error('Bad code');
          }

        }
      }
      if (add) {
        let filteredOut = {};
        for (let fKey in fields) {
          let value = row[fKey];
          if (value === '') {
            value = null;
          }else if (/^-?\d+$/.test(value)) {
            value = Number.parseInt(value);
          }else if (/^-?[\d.]+$/.test(value)) {
            value = Number.parseFloat(value);
          }
          filteredOut[FIELDS_ALT[fKey] || fKey] = value;
        }
        filteredOut.link = 'http://www.tsetmc.com/loader.aspx?ParTree=151311&i=' + key;
        let sectorName = getSectorName(row.cs);
        if (out[sectorName] === undefined) {
          out[sectorName] = [];
        }
        out[sectorName].push(filteredOut);
      }

    }
    let bOut = [];
    for (let key in out) {

      bOut.push({
        subName: key === 'NoCat'?null:key,
        items:   out[key],
      });
    }
    return bOut;
  }
  function filterCode(RawCode) {
    var FilterCode = RawCode;
    for (let Key in FIELDS_ALT) {
      FilterCode = FilterCode.replace(new RegExp('\(' + FIELDS_ALT[Key] + '\)', 'g'), `(${ Key })`);
    }
    FilterCode = FilterCode.replace(/\x28l18\x29/g, 'row["l18"]');
    FilterCode = FilterCode.replace(/\x28l30\x29/g, 'row["l30"]');
    FilterCode = FilterCode.replace(/\x28tno\x29/g, 'parseInt(row["tno"],10)');
    FilterCode = FilterCode.replace(/\x28tvol\x29/g, 'parseInt(row["tvol"],10)');
    FilterCode = FilterCode.replace(/\x28tval\x29/g, 'parseInt(row["tval"],10)');
    FilterCode = FilterCode.replace(/\x28py\x29/g, 'parseFloat(row["py"])');
    FilterCode = FilterCode.replace(/\x28pf\x29/g, 'parseFloat(row["pf"])');
    FilterCode = FilterCode.replace(/\x28pmin\x29/g, 'parseFloat(row["pmin"])');
    FilterCode = FilterCode.replace(/\x28pmax\x29/g, 'parseFloat(row["pmax"])');
    FilterCode = FilterCode.replace(/\x28pl\x29/g, 'parseFloat(row["pl"])');
    FilterCode = FilterCode.replace(/\x28plc\x29/g, 'parseFloat(row["plc"])');
    FilterCode = FilterCode.replace(/\x28plp\x29/g, 'parseFloat(row["plp"])');
    FilterCode = FilterCode.replace(/\x28pc\x29/g, 'parseFloat(row["pc"])');
    FilterCode = FilterCode.replace(/\x28pcc\x29/g, 'parseFloat(row["pcc"])');
    FilterCode = FilterCode.replace(/\x28pcp\x29/g, 'parseFloat(row["pcp"])');
    FilterCode = FilterCode.replace(/\x28eps\x29/g, 'parseFloat(row["eps"])');
    FilterCode = FilterCode.replace(/\x28pe\x29/g, 'parseFloat(row["pe"])');
    FilterCode = FilterCode.replace(/\x28pd1\x29/g, 'parseFloat(row["pd1"])');
    FilterCode = FilterCode.replace(/\x28zd1\x29/g, 'parseFloat(row["zd1"])');
    FilterCode = FilterCode.replace(/\x28qd1\x29/g, 'parseFloat(row["qd1"])');
    FilterCode = FilterCode.replace(/\x28po1\x29/g, 'parseFloat(row["po1"])');
    FilterCode = FilterCode.replace(/\x28zo1\x29/g, 'parseFloat(row["zo1"])');
    FilterCode = FilterCode.replace(/\x28qo1\x29/g, 'parseFloat(row["qo1"])');
    FilterCode = FilterCode.replace(/\x28pd2\x29/g, 'parseFloat(row["pd2"])');
    FilterCode = FilterCode.replace(/\x28zd2\x29/g, 'parseFloat(row["zd2"])');
    FilterCode = FilterCode.replace(/\x28qd2\x29/g, 'parseFloat(row["qd2"])');
    FilterCode = FilterCode.replace(/\x28po2\x29/g, 'parseFloat(row["po2"])');
    FilterCode = FilterCode.replace(/\x28zo2\x29/g, 'parseFloat(row["zo2"])');
    FilterCode = FilterCode.replace(/\x28qo2\x29/g, 'parseFloat(row["qo2"])');
    FilterCode = FilterCode.replace(/\x28pd3\x29/g, 'parseFloat(row["pd3"])');
    FilterCode = FilterCode.replace(/\x28zd3\x29/g, 'parseFloat(row["zd3"])');
    FilterCode = FilterCode.replace(/\x28qd3\x29/g, 'parseFloat(row["qd3"])');
    FilterCode = FilterCode.replace(/\x28po3\x29/g, 'parseFloat(row["po3"])');
    FilterCode = FilterCode.replace(/\x28zo3\x29/g, 'parseFloat(row["zo3"])');
    FilterCode = FilterCode.replace(/\x28qo3\x29/g, 'parseFloat(row["qo3"])');
    FilterCode = FilterCode.replace(/\x28bvol\x29/g, 'parseInt(row["bvol"],10)');
    FilterCode = FilterCode.replace(/\x28cs\x29/g, 'parseInt(row["cs"],10)');
    FilterCode = FilterCode.replace(/\x28tmax\x29/g, 'parseFloat(row["tmax"])');
    FilterCode = FilterCode.replace(/\x28tmin\x29/g, 'parseFloat(row["tmin"])');
    FilterCode = FilterCode.replace(/\x28z\x29/g, 'parseInt(row["z"],10)');
    FilterCode = FilterCode.replace(/\x28mv\x29/g, 'parseFloat(row["mv"])');
    FilterCode = FilterCode.replace(/\x28cfield0\x29/g, 'row["cfield0"]');
    FilterCode = FilterCode.replace(/\x28cfield1\x29/g, 'row["cfield1"]');
    FilterCode = FilterCode.replace(/\x28cfield2\x29/g, 'row["cfield2"]');
    FilterCode = FilterCode.replace(/\x28ct\x29/g, 'mw.ClientType[row["inscode"]]');
    FilterCode = FilterCode.replace(/\x5Bis/g, 'mw.InstStat[row["inscode"]][');
    FilterCode = FilterCode.replace(/\x5Bih\x5D/g, 'mw.InstHistory[row["inscode"]]');
    return FilterCode;
  }
  app.get('/', (req, res) => {
    res.json({error: 'No data'});
  });
  function checkFilters(filter) {

    let vmScript = new Script(filterCode(filter));
    for (var key in AllRows) {
      if (AllRows.hasOwnProperty(key)) {
        var row = AllRows[key];
        try {
          if (typeof mw.ClientType[row.inscode] == 'undefined') {
            mw.ClientType[row.inscode] = {
              Buy_CountI:    0,
              Buy_CountN:    0,
              Buy_I_Volume:  0,
              Buy_N_Volume:  0,
              Sell_CountI:   0,
              Sell_CountN:   0,
              Sell_I_Volume: 0,
              Sell_N_Volume: 0,
            };
          }
          var DummyFilterResult = vmScript.runInNewContext({
            row,
            mw,
          }, {timeout: 5000});
          break;
        }catch (e) {
          return {error: e};
          break;
        }
      }
    }
    return false;
  }
  app.post('/getData', async(req, res) => {
    let filters = req.body.filters || [];
    let data = [{}, {}];  //await getData();
    let settings = req.body.settings || {};
    if (req.body.checkFilter == true) {
      for (let filter of filters) {
        let result = checkFilters(filter);
        if (result) {
          return res.json({
            ok:     false,
            error:  result.error + '',
            filter: filter,
          });
        }
      }
      return res.json({ok: true});
    }

    try {
      let items = await getRows(filters, req.body.fields, settings);

      const out = {
        date:   data[1].l18,
        names:  data[2],
        result: items,
      };
      return res.json(out);
    }catch (e) {
      console.log(e);
      return res.json({error: 'got error'});
    }

  });
  app.listen(8080);
  RedisCli.del('rows', 'mw');
  setInterval(async() => {
    let jsonRows = await RedisCli.get('rows');
    let jsonMw = await RedisCli.get('mw');

    if (jsonRows) {
      AllRows = JSON.parse(jsonRows);
    }
    if (jsonMw) {
      mw = JSON.parse(jsonMw);
    }
  }, 1000);
  console.log('listening on 8080');
}

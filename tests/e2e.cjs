const assert = require('node:assert/strict');
const { chromium } = require('/opt/gorsee-mcp/node_modules/playwright-core');
const URL=process.env.NUTRI_URL || 'http://127.0.0.1:4174/nutri/';
const resultCases=[[0,'Хранительница всех ключей'],[1,'Справочное бюро имени тебя'],[2,'Человек-будильник'],[4,'Детектив по отчётам'],[6,'Добро пожаловать в День сурка']];

async function load(browser,width=390,clipboard=false) {
 const context=await browser.newContext({viewport:{width,height:850},locale:'ru-RU',permissions:clipboard?['clipboard-read','clipboard-write']:[]});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto(URL,{waitUntil:'networkidle'});
 return {context,page,errors};
}
async function fill(page,changes={}) {
 for (let i=0;i<7;i++) {
  await page.getByRole('radio').nth(Object.hasOwn(changes,i)?changes[i]:2).check();
  await page.getByRole('button',{name:i===6?'Узнать результат':'Дальше'}).click();
 }
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/opt/browser-audit/chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try {
  for(const width of [320,390,1366]){
   const {page,context,errors}=await load(browser,width);
   assert.match(await page.locator('h1').innerText(),/А это точно должна делать ты/);
   assert.match(await page.locator('header').innerText(),/интерактивный чек-лист для нутрициологов/i);
   assert.equal(await page.getByRole('radio').count(),4);
   assert.equal(await page.getByRole('button',{name:'Дальше'}).isDisabled(),true);
   await page.screenshot({path:'/opt/browser-audit/nutri-'+width+'-intro.png',fullPage:true});
   await page.getByRole('radio').first().check();
   await page.getByRole('button',{name:'Дальше'}).click();
   assert.match(await page.locator('legend').innerText(),/А где найти меню/);
   assert.doesNotMatch(await page.locator('header').innerText(),/Ведение клуба, марафона или мини-курса/);
   await page.getByRole('button',{name:/Назад/}).click();
   assert.equal(await page.getByRole('radio').first().isChecked(),true);
   await page.getByRole('radio').nth(2).check();
   await page.getByRole('button',{name:'Дальше'}).click();
   for(let i=1;i<7;i++){
    await page.getByRole('radio').nth(2).check();
    await page.getByRole('button',{name:i===6?'Узнать результат':'Дальше'}).click();
   }
   assert.match(await page.locator('h1').innerText(),/под контролем/);
   assert.equal(await page.locator('#additional-results').count(),0);
   assert.equal(await page.getByRole('link',{name:/Написать в Telegram/}).getAttribute('href'),'https://t.me/ludmila_avdeeva');
   assert.equal(await page.getByRole('link',{name:/Написать ВКонтакте/}).getAttribute('href'),'https://vk.com/ludmila_avdeeva');
   assert.match(await page.locator('#contact h2').innerText(),/^Привет, меня зовут Люда$/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   assert.deepEqual(errors,[]);
   await page.screenshot({path:'/opt/browser-audit/nutri-'+width+'-healthy.png',fullPage:true});
   await page.getByRole('button',{name:/Пройти ещё раз/}).click();
   assert.equal(await page.locator('input[type=radio]:checked').count(),0);
   console.log('PASS responsive, back, zero, reset',width);
   await context.close();
  }
  for(const [index,name] of resultCases){
   const {page,context,errors}=await load(browser);
   await fill(page,{[index]:0});
   assert.equal(await page.locator('h1').innerText(),name);
   assert.match(await page.locator('#main-result').innerText(),/С чего начать/);
   assert.match(await page.locator('#main-result').innerText(),/Как можно решить/);
   assert.equal(await page.locator('#additional-results').count(),0);
   assert.deepEqual(errors,[]);
   console.log('PASS single',name);
   await context.close();
  }
  const {page,context,errors}=await load(browser,390,true);
  await fill(page,{0:0,1:0,3:0,4:0});
  assert.match(await page.locator('h1').innerText(),/администратор собственного клуба/);
  assert.match(await page.locator('#main-result').innerText(),/Справочное бюро имени тебя/);
  const contact=await page.locator('#contact').boundingBox();
  const more=await page.locator('#additional-results').boundingBox();
  assert.ok(contact&&more&&contact.y<more.y);
  assert.equal(await page.locator('#additional-results details').getAttribute('open'),null);
  await page.locator('#additional-results summary').click();
  assert.match(await page.locator('#additional-results').innerText(),/Хранительница всех ключей/);
  assert.match(await page.locator('#additional-results').innerText(),/Детектив по отчётам/);
  await page.getByRole('button',{name:'Скопировать мои ответы'}).click();
  assert.equal(await page.getByRole('button',{name:'Ответы скопированы'}).count(),1);
  const clip=await page.evaluate(()=>navigator.clipboard.readText());
  assert.match(clip,/Привет, Люда/);
  assert.match(clip,/Как ты следишь за отчётами/);
  assert.match(clip,/Справочное бюро имени тебя/);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'/opt/browser-audit/nutri-390-combined.png',fullPage:true});
  console.log('PASS combined, accordion, clipboard');
  await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1});
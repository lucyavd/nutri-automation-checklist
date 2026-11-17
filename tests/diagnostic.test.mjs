import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, getDiagnosis, getSelectedAnswer, resultCatalog } from '../src/diagnostic.ts';

const start = 'Участница оплатила твою программу. Что происходит дальше?';
const end = 'Запускаешь новый поток программы. Сколько всего приходится готовить заново?';
const answerAt = (index, choice) => ({ [index]: questions[index].choices[choice].id });
const merged = (pairs) => Object.fromEntries(pairs.map(([i, c]) => [i, questions[i].choices[c].id]));

test('семь согласованных вопросов и четыре ответа в каждом', () => {
  assert.equal(questions.length, 7);
  assert.equal(questions[0].title, start);
  assert.equal(questions[6].title, end);
  for (const q of questions) assert.equal(q.choices.length, 4);
  assert.equal(questions[3].title,'Один и тот же вопрос от разных участниц. И так каждый день. Как ты с этим справляешься?');
  assert.equal(questions[1].choices[0].text, 'Сама ищу нужный материал и отправляю ссылку.');
  assert.equal(questions[0].choices[0].text, 'Проверяю оплату и сама отправляю доступы и инструкции.');
});

test('персональные результаты соответствуют пяти согласованным категориям', () => {
  assert.deepEqual(Object.keys(resultCatalog).sort(), ['access','helpdesk','relaunch','reminders','reports']);
  assert.deepEqual(Object.values(resultCatalog).map(r=>r.title), [
    'Хранительница всех ключей','Справочное бюро имени тебя',
    'Человек-будильник','Детектив по отчётам','Добро пожаловать в День сурка'
  ]);
});

test('нормально организованные процессы не порождают искусственной проблемы', () => {
  const good = merged([[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2]]);
  const d = getDiagnosis(good);
  assert.equal(d.main, null);
  assert.deepEqual(d.additional, []);
  assert.match(d.headline,/хорошо|налажено|порядке|контролем/i);
  assert.equal(getDiagnosis(merged([[0,3],[1,2],[2,3],[3,3],[4,3],[5,3],[6,3]])).main,null);
});

test('каждое проблемное направление может стать главным результатом', () => {
  const cases = [[0,'access'],[1,'helpdesk'],[2,'reminders'],[3,'helpdesk'],[4,'reports'],[5,'access'],[6,'relaunch']];
  for (const [i, expected] of cases) {
    const d=getDiagnosis(answerAt(i,0));
    assert.equal(d.main,expected,'вопрос '+(i+1));
    assert.deepEqual(d.additional,[]);
    assert.ok(d.advice.length>70);
  }
});

test('частично налаженные процессы не объявляются идеально работающими', () => {
  assert.equal(getDiagnosis(answerAt(0,1)).main,'access');
  assert.equal(getDiagnosis(answerAt(1,3)).main,'helpdesk');
  assert.equal(getDiagnosis(answerAt(4,1)).main,'reports');
  assert.equal(getDiagnosis(answerAt(6,1)).main,'relaunch');
});

test('несколько проблем дают объединяющий вывод и отдельные дополнительные рекомендации', () => {
  const d=getDiagnosis(merged([[0,0],[1,0],[3,0],[4,0]]));
  assert.match(d.headline,/администратор собственного клуба/);
  assert.ok(['access','helpdesk'].includes(d.main));
  assert.ok(d.additional.length>=1);
  assert.ok(d.additional.includes('reports'));
  assert.ok(!d.additional.includes(d.main));
});

test('реальные тексты ответов доступны для копирования, неизвестный ответ не выдумывается', () => {
  assert.equal(getSelectedAnswer(answerAt(0,0),0),questions[0].choices[0].text);
  assert.equal(getSelectedAnswer({},0),'');
});

test('проблема не добавляется из незаполненных или непроблемных ответов на любом сочетании', () => {
  for(let mask=0;mask<128;mask++){
    const ans=Object.fromEntries(questions.map((q,i)=>[i,q.choices[mask&(1<<i)?0:2].id]));
    const d=getDiagnosis(ans);
    assert.equal(d.main===null,mask===0,'mask '+mask);
    assert.ok(d.main===null || Object.hasOwn(resultCatalog,d.main));
    assert.equal(new Set(d.additional).size,d.additional.length);
    assert.ok(!d.additional.includes(d.main));
  }
});

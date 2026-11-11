// Chạy từ thư mục gốc: node scripts/verify-content.cjs
const fs=require('fs'),vm=require('vm'),assert=require('assert');const c={console,Math,Set};vm.createContext(c);for(const f of ['data.js','guides.js','questions.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);vm.runInContext(`
if(LESSONS.length!==73||DAYS.length!==175)throw Error('Missing lessons/days');
for(let i=0;i<DAYS.length;i++){let d=DAYS[i],l=LESSONS[d.lesson-1];if(d.id!==i+1||d.start<l.page||d.end>l.end)throw Error('Bad day '+d.id)}
for(let l of LESSONS){if(!G[l.key])throw Error('Missing guide '+l.key);for(let p=l.page;p<=l.end;p++){if(!DAYS.some(d=>d.lesson===l.id&&d.start<=p&&d.end>=p))throw Error('Uncovered page '+p)}}
for(let l of LESSONS)for(let i=1;i<=100;i++){let q=question(l.key,i);if(!q.q||!q.answer||!q.why)throw Error('Empty question');if(!correct(q.answer,q.answer))throw Error('Bad answer');if(q.options&&!q.options.includes(q.answer))throw Error('Invalid option')}
for(let kind of ['daily','week','month','quarter','mid','term'])for(let day of [1,5,20,45,90,91,110,135,175]){let e=makeExam(day,kind);let count={daily:5,week:10,month:15,quarter:20,mid:20,term:25}[kind];if(e.qs.length!==count)throw Error('Exam count '+day+' '+kind+' '+e.qs.length);if(new Set(e.qs.map(q=>q.q)).size!==count)throw Error('Duplicate question');if(day>90&&e.start<91)throw Error('Cross semester')}
for(let d of DAYS){let e=makeExam(d.id,'daily');if(e.qs.length!==5)throw Error('Daily count '+d.id+' '+e.qs.length)}
if(!correct('2/4','1/2')||correct('1/0','0')||correct('','0')||!correct('76 946','76946')||!correct('76.946','76946')||!correct('76,946','76946'))throw Error('Grading normalization');
console.log('PASS: 73 lessons, 175 days; all pages covered; 7300 generated samples; all 175 daily exams; 54 periodic exams; fraction and number grading.');
`,c);
for(let b=1;b<=2;b++)for(let p=1;p<=(b===1?130:118);p++)assert(fs.existsSync(`assets/b${b}-${p}.jpg`));

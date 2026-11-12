// Deterministic teaching choices and checked examples. AI may rephrase, never grade.
const MIATeaching=(()=>{
 function complexity(q){let numbers=(q.q.match(/\d[\d ]*/g)||[]).map(s=>Number(s.replace(/ /g,'')));return q.q.length/20+numbers.reduce((n,v)=>n+Math.log10(Math.max(1,v)),0)+(q.q.match(/[/:]/g)||[]).length*2}
 function plan(day,profile,lessons,days,guides,makeQuestion,expand,insights={},groups={}){
  let d=days[day-1],lesson=lessons[d.lesson-1],roots=groups[lesson.key]||[lesson.key],size=Math.ceil(roots.length/d.total),selected=roots.slice((d.session-1)*size,d.session*size);if(!selected.length)selected=roots.slice(-size);let scoped=selected.flatMap(expand);
  let skills=(profile?.skills||[]).filter(s=>scoped.includes(s.key)),need=skills.find(s=>s.n>=3&&(s.level==='repair'||s.decline)),key=need?.key||scoped[0],evidence=skills.find(s=>s.key===key),support=need||profile?.support==='slow'?'slow':profile?.support==='stretch'?'stretch':'standard',g=guides[key]||guides[lesson.key];
  let candidates=Array.from({length:16},(_,i)=>makeQuestion(key,day*137+11+i*19)).filter((q,i,rows)=>rows.findIndex(r=>r.q===q.q)===i).sort((a,b)=>complexity(a)-complexity(b));
  let sample=candidates[support==='stretch'?Math.floor(candidates.length/2):0],check=candidates.find(q=>q.q!==sample.q)||makeQuestion(key,day*137+29);
  return{version:2,key,support,selection:'Trong các ví dụ cùng dạng của bài hôm nay, ưu tiên câu ngắn và ít dữ kiện; đây là ước lượng độ đơn giản, không phải kết luận chắc chắn về mức hiểu của con.',reason:need?'Các câu đã làm cho thấy chủ đề này cần ôn lại.':support==='slow'?'Con cần cách giải chậm và từng bước nhỏ.':'Bắt đầu bằng một ví dụ rõ ràng rồi để con tự thử.',evidence:evidence?{distinct:evidence.n,correct:evidence.good,level:evidence.level}:null,rule:g.rule,steps:g.steps,mistake:g.mistake,insight:insights[key]||g.rule,scaffold:['Quan sát điều đề đã cho và điều cần tìm.','Dùng hình hoặc đồ vật quen thuộc để nói ý nghĩa của phép tính.','Làm mẫu từng bước nhỏ, nói vì sao chọn cách làm.','Con tự giải một câu khác rồi giải thích lại.'],example:{prompt:sample.q,answer:sample.answer,explanation:sample.why},check:{prompt:check.q,answer:check.answer,explanation:check.why,key:check.key}};
 }
 return{plan,complexity};
})();

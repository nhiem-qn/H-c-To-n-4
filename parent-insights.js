// Family feedback from released test answers only; never an AI diagnosis.
const MIAParentInsights=(()=>{
 function analyze(evidence,lessons,guides={}){
  const names=new Map(lessons.map(l=>[l.key,lessons.find(x=>x.key===l.key&&!/^Luyện tập chung$/.test(x.title))?.title||l.title]));let unique=new Map(),unmapped=0;
  for(let e of evidence){if(!e||typeof e.correct!=='boolean'||!e.prompt||!Number.isFinite(e.at))continue;if(!names.has(e.key)){unmapped++;continue}let key=e.key+':'+String(e.prompt).normalize('NFKC').replace(/\s+/g,' ').trim().toLocaleLowerCase('vi'),old=unique.get(key);if(!old||e.source==='online'&&old.source!=='online'||e.source===old.source&&e.at>=old.at)unique.set(key,e)}
  let groups=new Map();for(let e of unique.values()){if(!groups.has(e.key))groups.set(e.key,[]);groups.get(e.key).push(e)}
  let topics=[...groups].map(([key,rows])=>{rows.sort((a,b)=>a.at-b.at);let n=rows.length,good=rows.filter(e=>e.correct).length,recent=rows.slice(-4),previous=rows.slice(0,-4),declining=recent.length>=3&&previous.length>=3&&previous.filter(e=>e.correct).length/previous.length-recent.filter(e=>e.correct).length/recent.length>=.25;return{key,title:names.get(key),n,good,percent:Math.round(good/n*100),online:rows.filter(e=>e.source==='online').length,self:rows.filter(e=>e.source==='self').length,level:n<3?'observe':good/n<.6?'review':n>=5&&good/n>=.8&&!declining?'strength':'practice',declining,tip:guides[key]?.mistake||'Cùng con đọc lại yêu cầu, xem một ví dụ rồi tự làm một câu tương tự.'}}).sort((a,b)=>a.percent-b.percent||b.n-a.n);
  let strengths=topics.filter(t=>t.level==='strength'),weaknesses=topics.filter(t=>t.level==='review'),observing=topics.filter(t=>t.level==='observe'),reminders=[];
  if(!topics.length)reminders.push('Chưa có đủ bài kiểm tra để nhận xét. Cùng con hoàn thành bài kiểm tra ngày, để con tự làm và lưu kết quả trước khi xem báo cáo.');
  for(let t of weaknesses.slice(0,3))reminders.push('Ôn '+t.title+' trong 5–10 phút. '+t.tip+' Sau một ví dụ mẫu, để con tự làm 3 câu khác nhau và nói lại cách làm.');
  for(let t of topics.filter(t=>t.declining).slice(0,2))reminders.push(t.title+': kết quả ở các câu gần đây giảm so với các câu trước. Cùng con xem lại chỗ sai, hỏi con đã nghĩ thế nào rồi luyện ngắn, tránh học bù dồn.');
  if(observing.length)reminders.push('Một số chủ đề mới có 1–2 câu. Cần thêm vài câu khác nhau vào những buổi sau; chưa vội kết luận điểm mạnh hoặc điểm yếu.');
  if(strengths.length)reminders.push('Khen cách làm và sự cố gắng của con ở '+strengths.slice(0,2).map(t=>t.title).join(', ')+'. Nhờ con giải thích lại một câu để củng cố, thay vì chỉ khen điểm số.');
  reminders.push('Đồng hành đủ 4 bước: nghe cô giảng, xem sách giáo khoa, luyện tập, kiểm tra ngày. Khi con chưa hiểu, cùng xem hình trong sách rồi bấm Hỏi cô; không cần hiểu hết ngay lần đầu.','Cho con nghỉ mắt và vận động khi mệt. Khuyến khích tiến bộ của chính con, tránh so sánh với các bạn.');
  return{topics,strengths,weaknesses,observing,reminders,total:unique.size,good:[...unique.values()].filter(e=>e.correct).length,unmapped,sourceNote:'Chỉ phân tích câu đã trả lời trong bài tự kiểm tra và câu thi online đã công bố, thuộc thời gian đã chọn. Câu trùng chỉ tính một lần; ưu tiên kết quả máy chủ. Ít nhất 3 câu mới nhận xét phần cần ôn, ít nhất 5 câu và đúng từ 80% và chưa thấy xu hướng giảm mới ghi nhận điểm mạnh trong các câu đã làm. Bài tự kiểm tra là dữ liệu đồng bộ từ thiết bị. Việc đã nghe hoặc xem bài chưa chứng minh con đã hiểu.'};
 }
 return{analyze};
})();

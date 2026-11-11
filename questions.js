function question(key,seed=1){
 const keys=GROUPS[key];if(keys)return question(keys[seed%keys.length],seed);
 const n=seed%59+2,m=seed%7+2,a=1200+n*137,b=300+m*43;let q='',answer='',why='',options=null;
 const set=(x,y,z,o=null)=>{q=x;answer=String(y);why=z;options=o};
 switch(key){
 case 'num':set(`Số liền sau của ${a*10+9} là bao nhiêu?`,a*10+10,'Số liền sau bằng số đã cho cộng 1.');break;
 case 'calc':set(`${a} + ${m} × 100 = ?`,a+m*100,`Nhân trước: ${m} × 100 = ${m*100}; sau đó cộng ${a}.`);break;
 case 'parity':{let x=a+seed%2;set(`${x} là số chẵn hay số lẻ?`,x%2?'Số lẻ':'Số chẵn','Nhìn chữ số hàng đơn vị: 0, 2, 4, 6, 8 là số chẵn; 1, 3, 5, 7, 9 là số lẻ.',['Số chẵn','Số lẻ']);break}
 case 'expr':set(`Tính 35 + 5 × a khi a = ${n}.`,35+5*n,`Thay a = ${n}: 35 + 5 × ${n} = 35 + ${5*n} = ${35+5*n}.`);break;
 case 'word':set(`Ngày đầu cửa hàng bán ${n*10} quyển vở; ngày hai ít hơn ${n} quyển; ngày ba bằng tổng hai ngày đầu. Cả ba ngày bán bao nhiêu quyển?`,(n*10+n*9)*2,`Ngày hai: ${n*10} − ${n} = ${n*9}. Ngày ba: ${n*10} + ${n*9} = ${n*19}. Cả ba ngày: ${n*19} × 2 = ${n*38} quyển.`);break;
 case 'angle':set('Đơn vị thường dùng để đo góc là gì?','Độ (°)','Số đo góc được ghi bằng độ, kí hiệu °.',['Mét','Độ (°)','Ki-lô-gam','Phút']);break;
 case 'angles':{let x=seed%180+1,y=x<90?'Góc nhọn':x===90?'Góc vuông':x<180?'Góc tù':'Góc bẹt';set(`Góc có số đo ${x}° là loại góc nào?`,y,'Góc nhọn < 90°; góc vuông = 90°; 90° < góc tù < 180°; góc bẹt = 180°.',['Góc nhọn','Góc vuông','Góc tù','Góc bẹt']);break}
 case 'million':set(`Số liền sau của ${999980+n} là gì?`,999981+n,'Cộng 1 vào số đã cho; chú ý các hàng khi vượt qua 999 999.');break;
 case 'place':set(`Trong số ${n} 345 678, chữ số 3 có giá trị bao nhiêu?`,300000,'Chữ số 3 ở hàng trăm nghìn nên có giá trị 3 × 100 000 = 300 000.');break;
 case 'round':{let x=1200000+n*10000;set(`Làm tròn ${x} đến hàng trăm nghìn.`,Math.round(x/100000)*100000,'Nhìn hàng chục nghìn: từ 5 trở lên tăng hàng trăm nghìn thêm 1; nhỏ hơn 5 giữ nguyên. Thay các hàng sau bằng 0.');break}
 case 'compare':set(`Điền >, < hoặc = : ${a*100} … ${b*1000}`,a*100>b*1000?'>':a*100<b*1000?'<':'=','So số chữ số, sau đó so từng hàng từ trái sang phải.',['>','<','=']);break;
 case 'natural':set(`Số tự nhiên liền trước ${n*1000} là bao nhiêu?`,n*1000-1,'Số liền trước bằng số đã cho trừ 1.');break;
 case 'mass':set(`${n} tạ ${m} kg = … kg`,n*100+m,`1 tạ = 100 kg nên ${n} × 100 + ${m} = ${n*100+m} kg.`);break;
 case 'areaunit':set(`${n} m² ${m} dm² = … dm²`,n*100+m,`1 m² = 100 dm² nên ${n} × 100 + ${m} = ${n*100+m} dm².`);break;
 case 'time':set(`${n} phút ${m} giây = … giây`,n*60+m,`1 phút = 60 giây nên ${n} × 60 + ${m} = ${n*60+m} giây.`);break;
 case 'measure':return question(['mass','areaunit','time'][seed%3],seed);
 case 'add':set(`${a*10} + ${b*10} = ?`,(a+b)*10,'Đặt các chữ số cùng hàng thẳng cột, cộng từ phải sang trái.');break;
 case 'sub':set(`${a*10} − ${b*10} = ?`,(a-b)*10,'Đặt thẳng các hàng, trừ từ phải sang trái; thử lại bằng phép cộng.');break;
 case 'addprop':set(`Tính thuận tiện: ${n} + 375 + ${100-n}`,475,`${n} + ${100-n} = 100; 100 + 375 = 475.`);break;
 case 'sumdiff':set(`Hai số có tổng ${n*2+20}, hiệu 20. Số bé là bao nhiêu?`,n,`Số bé = (tổng − hiệu) : 2 = (${n*2+20} − 20) : 2 = ${n}.`);break;
 case 'perp':case 'drawperp':set('Hai đường thẳng vuông góc tạo thành mấy góc vuông tại giao điểm?',4,'Hai đường thẳng vuông góc tạo thành 4 góc vuông.');break;
 case 'parallel':case 'drawparallel':set('Hai đường thẳng song song có cắt nhau khi kéo dài mãi về hai phía không?','Không','Hai đường thẳng song song không cắt nhau dù kéo dài về hai phía.',['Có','Không']);break;
 case 'shapes':set('Hình nào có bốn cạnh bằng nhau?','Hình thoi','Hình thoi có bốn cạnh bằng nhau.',['Mọi hình bình hành','Mọi hình chữ nhật','Hình thoi']);break;
 case 'geometry':return question(['angles','perp','parallel','shapes'][seed%4],seed);
 case 'mul':set(`${a} × ${m} = ?`,a*m,'Nhân từng hàng từ phải sang trái và cộng phần nhớ.');break;
 case 'div':set(`${a*m} : ${m} = ?`,a,`Chia từ trái sang phải. Kiểm tra: ${a} × ${m} = ${a*m}.`);break;
 case 'mulprop':set(`Tính thuận tiện: 25 × ${n} × 4`,100*n,`Nhóm 25 × 4 = 100; 100 × ${n} = ${100*n}.`);break;
 case 'ten':set(`${a*100} : 100 = ?`,a,'Chia số tròn trăm cho 100: bỏ hai chữ số 0 tận cùng.');break;
 case 'distribute':set(`${n} × 25 + ${n} × 75 = ?`,100*n,`${n} × (25 + 75) = ${n} × 100 = ${100*n}.`);break;
 case 'mul2':set(`${a} × ${n+10} = ?`,a*(n+10),`Tách ${n+10} thành hàng chục và hàng đơn vị rồi cộng hai tích riêng.`);break;
 case 'div2':set(`${a*(n+10)} : ${n+10} = ?`,a,`Thử lại: ${a} × ${n+10} = ${a*(n+10)}.`);break;
 case 'estimate':set(`Làm tròn ${198+n*100} đến hàng trăm rồi nhân với 5 để ước lượng tích. Kết quả ước lượng là bao nhiêu?`,(200+n*100)*5,`Làm tròn thành ${200+n*100}, rồi nhân 5.`);break;
 case 'mean':set(`Trung bình cộng của ${n}, ${n+3}, ${n+6} là bao nhiêu?`,n+3,`(${n} + ${n+3} + ${n+6}) : 3 = ${n+3}.`);break;
 case 'unitary':set(`4 quyển vở giá ${m*4000} đồng. ${n} quyển cùng loại giá bao nhiêu đồng?`,m*1000*n,`Một quyển: ${m*4000} : 4 = ${m*1000} đồng. ${n} quyển: ${m*1000} × ${n} = ${m*1000*n} đồng.`);break;
 case 'stats':set(`Dãy ${n}, ${n+5}, ${n+2}, ${n+9} có số lớn nhất là bao nhiêu?`,n+9,'So sánh các số trong dãy, chọn số có giá trị lớn nhất.');break;
 case 'chart':set(`Biểu đồ ghi số sách: lớp 4A ${n*5} quyển; lớp 4B ${(n+2)*5} quyển; lớp 4C ${(n+1)*5} quyển. Lớp 4B nhiều hơn 4A bao nhiêu quyển?`,10,`${(n+2)*5} − ${n*5} = 10 quyển.`);break;
 case 'event':set(`Tung đồng xu ${n+10} lần, mặt sấp xuất hiện ${n} lần. Mặt ngửa xuất hiện mấy lần?`,10,`Tổng số lần = số lần sấp + số lần ngửa; ${n+10} − ${n} = 10.`);break;
 case 'fraction':set(`Chiếc bánh chia thành ${n+3} phần bằng nhau, lấy ${n} phần. Viết phân số chỉ phần bánh đã lấy.`,`${n}/${n+3}`,'Tử số là số phần lấy, mẫu số là tổng số phần bằng nhau.');break;
 case 'fracdiv':set(`Viết thương ${n} : ${n+3} dưới dạng phân số.`,`${n}/${n+3}`,'Số bị chia làm tử số, số chia làm mẫu số.');break;
 case 'equiv':set(`Điền số: ${n}/${n+3} = …/${(n+3)*2}`,n*2,'Mẫu đã nhân 2, vì vậy tử cũng phải nhân 2.');break;
 case 'reduce':set(`Rút gọn ${n*2}/${(n+1)*2}.`,`${n}/${n+1}`,'Chia cả tử và mẫu cho 2. Hai số tự nhiên liên tiếp không có ước chung lớn hơn 1.');break;
 case 'common':set(`Quy đồng 1/3 và 1/4 với mẫu chung 12. Tử số mới của 1/3 là bao nhiêu?`,4,'12 : 3 = 4; nhân cả tử và mẫu của 1/3 với 4 được 4/12.');break;
 case 'fraccompare':set(`Điền dấu: ${n}/${n+3} … ${n+1}/${n+3}`,'<','Cùng mẫu, tử số nhỏ hơn thì phân số nhỏ hơn.',['>','<','=']);break;
 case 'fracadd':set(`${n}/${n+5} + 2/${n+5} = ?`,`${n+2}/${n+5}`,'Cùng mẫu thì cộng các tử, giữ nguyên mẫu; rút gọn nếu được.');break;
 case 'fracsub':set(`${n+2}/${n+5} − 2/${n+5} = ?`,`${n}/${n+5}`,'Cùng mẫu thì trừ các tử, giữ nguyên mẫu; rút gọn nếu được.');break;
 case 'fracmul':set(`${n}/${n+1} × ${n+1}/${n+3} = ?`,`${n}/${n+3}`,'Nhân tử với tử, mẫu với mẫu; rút gọn thừa số chung.');break;
 case 'fracquot':set(`${n}/${n+1} : ${n+2}/${n+1} = ?`,`${n}/${n+2}`,'Giữ phân số thứ nhất, nhân với phân số đảo ngược của phân số thứ hai rồi rút gọn.');break;
 case 'fractionof':set(`Tìm 3/4 của ${n*4}.`,n*3,`${n*4} : 4 × 3 = ${n*3}.`);break;
 default:throw Error('Chưa có ngân hàng cho '+key);
 }
 return {q,answer,why,options,key,source:'Bài bổ sung do ứng dụng biên soạn',id:key+'-'+seed};
}
const ORIGINAL=[
 ['num', 'Số 65 243 được đọc như thế nào?', 'Sáu mươi lăm nghìn hai trăm bốn mươi ba', 'Tách 65 nghìn và 243.', ['Sáu mươi lăm nghìn hai trăm bốn mươi ba','Sáu mươi lăm nghìn hai trăm ba mươi tư'], 'Bài tập cuối tuần KNTT tuần 1, câu 2'],
 ['num','Trong các số 23 467; 23 746; 23 476, số nào có chữ số hàng trăm là 7?',23746,'23 746 có chữ số 7 ở hàng trăm.',null,'Bài tập cuối tuần KNTT tuần 1, câu 3 (lược các phương án trùng)'],
 ['num','Số bé nhất trong các số 1 346; 12 487; 84 689; 93 451 là số nào?',1346,'1 346 có bốn chữ số; các số còn lại có năm chữ số.',null,'Bài tập cuối tuần KNTT tuần 1, câu 6'],
 ['num','Số lớn nhất trong các số 8 204; 8 454; 4 887; 8 840 là số nào?',8840,'So sánh từ hàng nghìn rồi hàng trăm.',null,'Bài tập cuối tuần KNTT tuần 1, câu 7'],
 ['place','Chữ số 5 trong số 14 531 274 có giá trị bao nhiêu?',500000,'Chữ số 5 thuộc hàng trăm nghìn.',null,'5 đề ôn tập giữa HK1 KNTT, đề 2, câu 4'],
 ['time','6 giờ 15 phút bằng bao nhiêu phút?',375,'6 × 60 + 15 = 375 phút.',null,'5 đề ôn tập giữa HK1 KNTT, đề 2, câu 5'],
 ['add','52 475 + 24 471 = ?',76946,'Cộng thẳng cột: 52 475 + 24 471 = 76 946.',null,'5 đề ôn tập giữa HK1 KNTT, phần tự luận'],
 ['sub','63 178 − 11 478 = ?',51700,'Trừ thẳng cột được 51 700; cộng lại để thử.',null,'5 đề ôn tập giữa HK1 KNTT, phần tự luận'],
 ['word','Một trại gà ngày đầu bán 3 756 con, ngày hai bán ít hơn 2 504 con, ngày ba bán bằng tổng hai ngày đầu. Cả ba ngày bán bao nhiêu con?',10016,'Ngày hai: 3 756 − 2 504 = 1 252. Ngày ba: 3 756 + 1 252 = 5 008. Cả ba ngày: 10 016 con.',null,'5 đề ôn tập giữa HK1 KNTT, đề 2, tự luận'],
 ['parity','Số chẵn lớn nhất có 6 chữ số là số nào?',999998,'Số lớn nhất có 6 chữ số là 999 999; số chẵn liền trước là 999 998.',null,'5 đề ôn tập giữa HK1 KNTT, đề 3, câu 2'],
 ['round','190 101 994 làm tròn đến hàng trăm nghìn được số nào?',190100000,'Chữ số hàng chục nghìn là 0 nên giữ hàng trăm nghìn.',null,'5 đề ôn tập giữa HK1 KNTT, đề 3, câu 3'],
 ['time','Năm 924 thuộc thế kỉ thứ mấy? (Nhập số)',10,'Từ năm 901 đến 1000 thuộc thế kỉ X.',null,'5 đề ôn tập giữa HK1 KNTT, đề 3, câu 7'],
 ['expr','12 : (3 − m) với m = 2 bằng bao nhiêu?',12,'12 : (3 − 2) = 12 : 1 = 12.',null,'5 đề ôn tập giữa HK1 KNTT, đề 3, câu 8'],
 ['mass','4 tấn 50 yến bằng bao nhiêu yến?',450,'4 tấn = 400 yến; 400 + 50 = 450 yến.',null,'5 đề ôn tập giữa HK1 KNTT, đề 3, câu 11'],
 ['time','2 phút 12 giây bằng bao nhiêu giây?',132,'2 × 60 + 12 = 132 giây.',null,'5 đề ôn tập giữa HK1 KNTT, đề 3, câu 11'],
 ['round','9 875 624 làm tròn đến hàng trăm nghìn được số nào?',9900000,'Hàng chục nghìn là 7 nên làm tròn lên 9 900 000.',null,'5 đề ôn tập giữa HK1 KNTT, đề 4, câu 3'],
 ['natural','Số liền trước của 200 000 là số nào?',199999,'200 000 − 1 = 199 999.',null,'5 đề ôn tập giữa HK1 KNTT, đề 4, câu 5'],
 ['expr','(m + 4) × 3 với m = 21 bằng bao nhiêu?',75,'(21 + 4) × 3 = 25 × 3 = 75.',null,'5 đề ôn tập giữa HK1 KNTT, đề 4, câu 8'],
 ['mass','6 tạ 5 kg bằng bao nhiêu kg?',605,'6 × 100 + 5 = 605 kg.',null,'5 đề ôn tập giữa HK1 KNTT, đề 4, câu 11'],
 ['time','5 phút 48 giây bằng bao nhiêu giây?',348,'5 × 60 + 48 = 348 giây.',null,'5 đề ôn tập giữa HK1 KNTT, đề 4, câu 11']
].map((r,i)=>({key:r[0],q:r[1],answer:String(r[2]),why:r[3],options:r[4],source:r[5],id:'source-'+i}));
function normal(s){return String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[.,](?=\d{3}(?:\D|$))/g,'').replace(/\s+/g,'').replace(/⁄/g,'/').replace(/,/g,'.').replace(/[.!?;:]+$/g,'')}
function numeric(s){s=normal(s);if(/^[-+]?\d+(?:\.\d+)?$/.test(s))return Number(s);if(/^[-+]?\d+\/\d+$/.test(s)){let[a,b]=s.split('/').map(Number);if(b!==0)return a/b}return null}
function correct(input,answer){let a=numeric(input),b=numeric(answer);return a!==null&&b!==null?Math.abs(a-b)<1e-9:normal(input)===normal(answer)}
function shuffle(a){let out=[...a];for(let i=out.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function expandKey(k){return GROUPS[k]?GROUPS[k].flatMap(expandKey):[k]}
function makeExam(day,kind){let width={daily:1,week:5,month:20,quarter:60,mid:45,term:90}[kind],count={daily:5,week:10,month:15,quarter:20,mid:20,term:25}[kind];let start=kind==='term'?(day>90?91:1):kind==='mid'?(day>90?91:1):Math.max(day>90?91:1,day-width+1);let keys=[...new Set(DAYS.filter(d=>d.id>=start&&d.id<=day).flatMap(d=>expandKey(LESSONS[d.lesson-1].key)))];let originals=shuffle(ORIGINAL.filter(q=>keys.includes(q.key)&&(!q.minLesson||DAYS[day-1].lesson>=q.minLesson))).slice(0,Math.floor(count/3));let seen=new Set(originals.map(x=>x.q)),qs=[...originals];for(let i=0;qs.length<count&&i<2000;i++){let key=keys[i%keys.length],q=question(key,Math.floor(Math.random()*100000));if(!seen.has(q.q)){seen.add(q.q);qs.push(q)}}return {qs:shuffle(qs),start,end:day,kind}}
// Các câu khái niệm đa dạng để một đề ngắn vẫn đủ số câu, không lặp câu.
const CONCEPTS={
angle:[['Góc vuông có số đo bao nhiêu độ?',90,'Góc vuông bằng 90°.'],['Góc bẹt có số đo bao nhiêu độ?',180,'Góc bẹt bằng hai góc vuông: 180°.'],['Khi đo góc, tâm thước phải trùng với đâu?','Đỉnh góc','Đặt tâm thước trùng đỉnh góc.',['Đỉnh góc','Một điểm bất kì']],['Cạnh thứ nhất trùng vạch 0°, cạnh thứ hai chỉ 60° trên cùng thang đo. Góc có số đo bao nhiêu độ?',60,'Đọc đúng thang bắt đầu từ 0° của cạnh thứ nhất.'],['Hai góc có số đo 40° và 70°. Góc nào lớn hơn? (Nhập số đo)',70,'70 lớn hơn 40 nên góc 70° lớn hơn.'],['Một góc bằng hai góc vuông. Góc đó có số đo bao nhiêu độ?',180,'90 × 2 = 180°.']],
perp:[['Hai đường thẳng vuông góc tạo thành mấy góc vuông?',4,'Có 4 góc vuông tại giao điểm.'],['Dụng cụ nào phù hợp để kiểm tra góc vuông?','Ê ke','Ê ke có một góc vuông.',['Ê ke','Cân']],['Hai đường thẳng cắt nhau có luôn vuông góc không?','Không','Chỉ vuông góc khi tạo góc 90°.',['Có','Không']],['Hai cạnh kề của hình chữ nhật tạo góc bao nhiêu độ?',90,'Bốn góc hình chữ nhật là góc vuông.'],['Hai đường thẳng vuông góc có giao điểm không?','Có','Chúng cắt nhau tại một điểm và tạo góc vuông.',['Có','Không']],['Hai đường thẳng cắt nhau tạo một góc 60°. Chúng có vuông góc không?','Không','Góc 60° khác 90°.',['Có','Không']]],
parallel:[['Hai đường thẳng song song có cắt nhau khi kéo dài mãi không?','Không','Song song nghĩa là không cắt nhau dù kéo dài.',['Có','Không']],['Hai cạnh đối diện của hình chữ nhật có song song không?','Có','Mỗi cặp cạnh đối diện của hình chữ nhật song song.',['Có','Không']],['Hai cạnh kề của hình chữ nhật có song song không?','Không','Hai cạnh kề vuông góc và có chung đỉnh.',['Có','Không']],['Một đường thẳng cắt cả hai đường thẳng song song tại hai điểm khác nhau. Có mấy giao điểm?',2,'Mỗi đường gặp đường cắt tại một điểm.'],['Hai đường thẳng cùng vuông góc với một đường thẳng và đi qua hai điểm khác nhau trên đường đó có song song không?','Có','Hai đường đó song song với nhau.',['Có','Không']],['Một hình chữ nhật có mấy cặp cạnh đối diện song song?',2,'Có hai cặp cạnh đối diện.']],
shapes:[['Hình thoi có mấy cạnh bằng nhau?',4,'Bốn cạnh của hình thoi bằng nhau.'],['Hình bình hành có mấy cặp cạnh đối diện song song?',2,'Hai cặp cạnh đối diện song song.'],['Hình thoi có hai cặp cạnh đối diện song song không?','Có','Hình thoi cũng là hình bình hành.',['Có','Không']],['Hình có hai cặp cạnh đối diện song song được gọi là gì?','Hình bình hành','Đây là đặc điểm của hình bình hành.',['Hình bình hành','Hình tam giác']],['Một hình thoi có cạnh dài 6 cm. Tổng độ dài bốn cạnh bằng bao nhiêu cm?',24,'6 × 4 = 24 cm.'],['Một hình bình hành có các cạnh đối diện bằng nhau. Một cạnh dài 8 cm thì cạnh đối diện dài bao nhiêu cm?',8,'Hai cạnh đối diện của hình bình hành bằng nhau.']],
common:[['Quy đồng 1/3 và 1/4 với mẫu chung 12: tử mới của 1/3 là bao nhiêu?',4,'1/3 = 4/12.'],['Quy đồng 1/3 và 1/4 với mẫu chung 12: tử mới của 1/4 là bao nhiêu?',3,'1/4 = 3/12.'],['Viết phân số bằng 2/5 có mẫu số 10.', '4/10','Nhân cả tử và mẫu với 2.'],['Viết phân số bằng 3/4 có mẫu số 12.','9/12','Nhân cả tử và mẫu với 3.'],['Một mẫu số chung của 3 và 5 là 15. Tử số mới của 2/3 là bao nhiêu?',10,'15 : 3 = 5; 2 × 5 = 10.'],['Quy đồng 1/2 và 1/6 với mẫu chung 6: tử mới của 1/2 là bao nhiêu?',3,'1/2 = 3/6.']]
};
CONCEPTS.drawperp=CONCEPTS.perp;CONCEPTS.drawparallel=CONCEPTS.parallel;
const generatedQuestion=question;
question=function(key,seed=1){if(CONCEPTS[key]){let r=CONCEPTS[key][seed%CONCEPTS[key].length];return {key,q:r[0],answer:String(r[1]),why:r[2],options:r[3]||null,source:'Bài bổ sung do ứng dụng biên soạn',id:key+'-concept-'+seed%CONCEPTS[key].length}}return generatedQuestion(key,seed)};
[
 ['ten','710 × 100 = ?',71000,'Nhân với 100: viết thêm hai chữ số 0 bên phải.','Đề giữa HK2 năm 25–26, đề 2, câu 1'],
 ['div2','5 460 : 20 = ?',273,'5 460 : 2 : 10 = 2 730 : 10 = 273.','Đề giữa HK2 năm 25–26, đề 2, câu 2'],
 ['mul2','3 275 × 64 = ?',209600,'3 275 × 60 + 3 275 × 4 = 196 500 + 13 100 = 209 600.','Đề giữa HK2 năm 25–26, đề 2, câu 8a'],
 ['div2','297 568 : 68 = ?',4376,'Thử lại: 4 376 × 68 = 297 568.','Đề giữa HK2 năm 25–26, đề 2, câu 8b'],
 ['areaunit','90 cm² bằng bao nhiêu mm²?',9000,'1 cm² = 100 mm²; 90 × 100 = 9 000.','Đề giữa HK2 năm 25–26, đề 2, câu 9a'],
 ['areaunit','500 000 mm² bằng bao nhiêu dm²?',50,'1 dm² = 10 000 mm²; 500 000 : 10 000 = 50.','Đề giữa HK2 năm 25–26, đề 2, câu 9b'],
 ['div2','6 400 : (8 × 2) = ?',400,'6 400 : 16 = 400.','Đề giữa HK2 năm 25–26, đề 2, câu 10a'],
 ['mulprop','Tính thuận tiện: 2 × 3 × 4 × 8 × 50 × 25 × 125',30000000,'3 × (2 × 50) × (4 × 25) × (8 × 125) = 3 × 100 × 100 × 1 000 = 30 000 000.','Đề giữa HK2 năm 25–26, đề 2, câu 12'],
 ['mean','Hai số có trung bình cộng là 1 001 và hiệu 802. Số bé bằng bao nhiêu?',600,'Tổng: 1 001 × 2 = 2 002. Số bé: (2 002 − 802) : 2 = 600.','Đề giữa HK2 năm 25–26, câu 7 (hỏi số bé)'],
 ['unitary','Ô tô đi 12 km hết 1 lít xăng. Đi 180 km hết bao nhiêu lít xăng?',15,'180 : 12 = 15 lít xăng.','Bộ đề ôn HK2 KNTT 24–25, đề 2, câu 8'],
 ['div2','Phép chia có số chia 39. Số dư lớn nhất có thể bằng bao nhiêu?',38,'Số dư nhỏ hơn số chia, nên lớn nhất là 39 − 1 = 38.','Bộ đề ôn HK2 KNTT 24–25, đề 2, câu 7']
].forEach((r,i)=>ORIGINAL.push({key:r[0],q:r[1],answer:String(r[2]),why:r[3],source:r[4],options:null,id:'source-hk2-'+i,minLesson:r[0]==='mean'?46:r[0]==='unitary'?47:r[0]==='div2'?44:r[0]==='mul2'?43:r[0]==='mulprop'?40:r[0]==='ten'?41:18}));
ORIGINAL.find(q=>q.id==='source-9').minLesson=10;

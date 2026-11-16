// Supplementary observation/word-play puzzles. Fixed, checked answers, no IQ labels.
const MIADaytimeBank=(()=>{
 const puzzles=[];
 const add=(id,q,answer,options,picture,hint,why)=>puzzles.push({id,key:'thinking:'+id,kind:'thinking',q,answer:String(answer),options:options.map(String),picture,hint,why,source:'Câu đố quan sát và suy luận bổ trợ · Không thay thế bài học SGK'});
 const rebus=[
 ['raincoat','Hình chiếc áo và những giọt mưa gợi tên đồ dùng nào?','Áo mưa',['Áo mưa','Áo len','Mũ len','Giày thể thao'],['👕','🌧️'],['Trang phục','Trời đang mưa'],'Nghĩ đến đồ mặc bên ngoài để tránh bị ướt.','Ghép áo với mưa thành áo mưa, đồ mặc để che mưa.'],
 ['football','Hình quả bóng và bàn chân gợi tên môn thể thao nào?','Bóng đá',['Bóng đá','Bóng rổ','Bóng bàn','Cầu lông'],['⚽','🦶'],['Quả bóng','Bàn chân'],'Môn này chủ yếu dùng chân điều khiển bóng.','Quả bóng cùng động tác đá bằng chân gợi tên bóng đá.'],
 ['orange','Hình giọt nước và quả cam gợi tên đồ uống nào?','Nước cam',['Nước cam','Sữa tươi','Nước dừa','Trà sen'],['💧','🍊'],['Giọt nước','Quả có múi'],'Đồ uống được làm từ loại quả trong hình.','Nước và cam ghép thành nước cam.'],
 ['schoolbag','Hình chiếc cặp và quyển sách gợi tên đồ dùng nào?','Cặp sách',['Cặp sách','Giá sách','Bàn học','Hộp bút'],['🎒','📚'],['Đồ đeo trên vai','Những quyển sách'],'Đồ dùng mang sách vở đến lớp.','Chiếc cặp đựng sách vở thường được gọi là cặp sách.'],
 ['nightlight','Hình chiếc đèn nhỏ cạnh giường gợi tên đồ dùng nào?','Đèn ngủ',['Đèn ngủ','Đèn đường','Đèn giao thông','Đèn sân khấu'],['💡','🛏️'],['Đèn nhỏ','Chiếc giường'],'Đèn đặt cạnh giường thường dùng lúc chuẩn bị đi ngủ.','Đèn dùng cạnh chỗ ngủ được gọi là đèn ngủ.'],
 ['sunflower','Hình bông hoa hướng về phía mặt trời gợi tên loài hoa nào?','Hoa hướng dương',['Hoa hướng dương','Hoa sen','Hoa hồng','Hoa mai'],['🌼','☀️'],['Bông hoa','Phía mặt trời'],'Dương có nghĩa liên quan đến mặt trời.','Bông hoa hướng về mặt trời gợi tên hoa hướng dương.'],
 ['rainbow','Hình một cây cầu và dải màu cong gợi từ nào?','Cầu vồng',['Cầu vồng','Cầu thang','Cầu tre','Cầu cảng'],['🌉','🌈'],['Cây cầu','Dải bảy màu'],'Nghĩ đến dải màu cong thường thấy sau cơn mưa.','Hình cây cầu và vòm màu gợi từ cầu vồng.'],
 ['bicycle','Hình hai bánh xe cùng bàn đạp gợi tên phương tiện nào?','Xe đạp',['Xe đạp','Xe buýt','Máy bay','Tàu thủy'],['🚲'],['Hai bánh và bàn đạp'],'Người đi dùng chân đạp để xe chuyển động.','Xe có hai bánh và bàn đạp là xe đạp.'],
 ['watch','Hình chiếc đồng hồ ở cổ tay gợi cụm từ nào?','Đồng hồ đeo tay',['Đồng hồ đeo tay','Đồng hồ treo tường','Đồng hồ cát','Lịch bàn'],['⌚'],['Mặt số ở cổ tay'],'Chú ý vị trí sử dụng chiếc đồng hồ.','Đồng hồ được đeo ở cổ tay gọi là đồng hồ đeo tay.'],
 ['treehouse','Hình ngôi nhà nhỏ trên cây gợi cụm từ nào?','Nhà trên cây',['Nhà trên cây','Nhà dưới biển','Nhà trên mây','Nhà trong hang'],['🏠','🌳'],['Ngôi nhà ở phía trên','Một cái cây'],'Ghép tên ngôi nhà với vị trí của nó.','Ngôi nhà được đặt trên cây nên gọi là nhà trên cây.'],
 ['bookshelf','Hình nhiều quyển sách xếp trên các ngăn gợi tên đồ dùng nào?','Giá sách',['Giá sách','Bàn ăn','Giường ngủ','Tủ lạnh'],['📚','🗄️'],['Các quyển sách','Những ngăn để đồ'],'Đồ dùng giúp xếp sách gọn theo từng ngăn.','Giá dùng xếp và giữ sách được gọi là giá sách.'],
 ['icecream','Hình que kem bên cạnh khối băng gợi món ăn nào?','Kem lạnh',['Kem lạnh','Canh nóng','Bánh hấp','Cháo nóng'],['🍦','🧊'],['Món tráng miệng','Khối băng'],'Chú ý cảm giác nóng hay lạnh của món ăn.','Kem được giữ lạnh, hình khối băng giúp gợi đặc điểm đó.']
 ];
 for(let [id,q,a,o,icons,labels,h,w] of rebus)add('word-'+id,q,a,o,{type:'rebus',icons,labels,alt:labels.join(' và ')},h,w);
 for(let n=1;n<=12;n++){
  let step=n%4+2,start=n+1,seq=[start,start+step,start+2*step],answer=start+3*step;
  add('sequence-'+n,'Dãy số '+seq.join(', ')+'. Số tiếp theo là bao nhiêu?',answer,[answer,answer+1,answer+step,answer-1],{type:'sequence',values:[...seq,'?'],alt:'Các ô số '+seq.join(', ')+', một ô trống'},'So sánh hai số liền nhau, rồi giữ nguyên cách tăng đó.',seq.map((x,i)=>i<2?seq[i+1]+' − '+x+' = '+step:'').filter(Boolean).join('; ')+'. Mỗi lần tăng '+step+', nên số tiếp theo là '+answer+'.');
  let a=n%4+2,b=n%3+2,c=n%5+2,total=a+b+c;
  add('missing-'+n,'Ba nhóm có '+a+', '+b+' và ô trống hình. Tổng là '+total+' hình. Ô trống có bao nhiêu hình?',c,[c,c+1,c+2,c+3],{type:'groups',counts:[a,b,null],total,alt:'Nhóm một '+a+' hình, nhóm hai '+b+' hình, nhóm ba chưa biết; tổng '+total},'Cộng hai nhóm đã biết, rồi lấy tổng trừ đi phần đó.',total+' − ('+a+' + '+b+') = '+c+'. Nhóm còn thiếu có '+c+' hình.');
  let rows=n%3+2,cols=n%4+2,count=rows*cols;
  add('grid-'+n,'Có '+rows+' hàng, mỗi hàng '+cols+' hình. Có tất cả bao nhiêu hình?',count,[count,count+rows,count+1,count-1],{type:'grid',rows,cols,alt:rows+' hàng, mỗi hàng '+cols+' hình'},'Đếm số hàng và số hình ở mỗi hàng; có thể dùng phép nhân.',rows+' × '+cols+' = '+count+'. Nhân giúp đếm các hàng bằng nhau.');
  let values=[n+2,n+4,n+1];for(let i=0;i<n%3;i++)values.push(values.shift());let largest=Math.max(...values),label=['Nhóm A','Nhóm B','Nhóm C'][values.indexOf(largest)];
  add('compare-'+n,'Quan sát ba nhóm hình. Nhóm nào có nhiều hình nhất?',label,['Nhóm A','Nhóm B','Nhóm C','Ba nhóm bằng nhau'],{type:'compare',counts:values,alt:values.map((v,i)=>'Nhóm '+String.fromCharCode(65+i)+' có '+v+' hình').join('; ')},'Đếm hoặc so sánh từng nhóm trước khi chọn.','Các nhóm có '+values.join(', ')+' hình. '+label+' có '+largest+' hình, nhiều nhất.');
 }
 function select(seed,count=3){let word=puzzles.filter(q=>q.id.startsWith('word-')),math=puzzles.filter(q=>!q.id.startsWith('word-'));return[word[seed%word.length],math[seed%math.length],math[(seed+17)%math.length]].slice(0,count).map(q=>({...q,picture:JSON.parse(JSON.stringify(q.picture)),options:[...q.options]}))}
 return{all:()=>puzzles,select};
})();

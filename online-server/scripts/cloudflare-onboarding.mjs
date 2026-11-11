// Official API: https://developers.cloudflare.com/api/resources/workers/subresources/subdomains/methods/update/
// Only initialize an absent namespace; preserve every existing workers.dev name.
export async function ensureWorkersSubdomain(cf,candidate){
 let current;
 try{current=await cf('/workers/subdomain')}
 catch(error){if(error.status!==404||!error.codes?.includes(10007))throw error}
 if(current?.subdomain)return current;
 const created=await cf('/workers/subdomain','PUT',{subdomain:candidate});
 const confirmed=created?.subdomain?created:await cf('/workers/subdomain');
 if(!confirmed?.subdomain)throw Error('Cloudflare chưa xác nhận địa chỉ workers.dev. Hãy mở Workers & Pages trong tài khoản rồi chạy lại.');
 return confirmed
}

import * as THREE from './assets/vendor/three.module.min.js';
export class Classroom3D {
 constructor(container){
  this.container=container;this.people=new Map();this.labels=new Map();this.disposed=false;this.last=performance.now();
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#e9f5ff');this.scene.fog=new THREE.Fog('#e9f5ff',22,48);
  this.camera=new THREE.PerspectiveCamera(35,1,.1,70);this.camera.position.set(0,8.5,11.5);this.camera.lookAt(0,.4,1.2);
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.outputColorSpace=THREE.SRGBColorSpace;container.appendChild(this.renderer.domElement);
  this.overlay=document.createElement('div');this.overlay.className='mia-avatar-labels';container.appendChild(this.overlay);
  this.scene.add(new THREE.HemisphereLight(0xffffff,0x8eab72,2.3));let sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-5,12,6);this.scene.add(sun);
  this.boxGeometry=new THREE.BoxGeometry(1,1,1);this.sphereGeometry=new THREE.SphereGeometry(1,12,10);this.cylinderGeometry=new THREE.CylinderGeometry(1,1,1,10);
  this.materials={floor:new THREE.MeshStandardMaterial({color:'#d6eee9',roughness:.9}),wood:new THREE.MeshStandardMaterial({color:'#f8ce98',roughness:.7}),frame:new THREE.MeshStandardMaterial({color:'#80b8c1'}),skin:new THREE.MeshStandardMaterial({color:'#f0be91'}),hair:new THREE.MeshStandardMaterial({color:'#49382c'}),pants:new THREE.MeshStandardMaterial({color:'#697ab2'}),white:new THREE.MeshStandardMaterial({color:'#fffef5'}),cheek:new THREE.MeshStandardMaterial({color:'#f29aa5'}),mint:new THREE.MeshStandardMaterial({color:'#9edac5'}),pink:new THREE.MeshStandardMaterial({color:'#f5bdd4'}),yellow:new THREE.MeshStandardMaterial({color:'#ffdf83'})};
  let floor=this.box(this.materials.floor,24,.12,23,0,-.1,1);this.scene.add(floor);
  for(let i=0;i<40;i++)this.scene.add(this.chair(i));
  let aisle=this.box(new THREE.MeshStandardMaterial({color:'#e6eccf'}),1.2,.02,18,0,.01,1);this.scene.add(aisle);this.decorate();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.animate=this.animate.bind(this);this.raf=requestAnimationFrame(this.animate)
 }
 box(mat,w,h,d,x,y,z){let m=new THREE.Mesh(this.boxGeometry,mat);m.scale.set(w,h,d);m.position.set(x,y,z);return m}
 seatPosition(seat){let row=Math.floor(seat/8),col=seat%8;return new THREE.Vector3((col-3.5)*2.15+(col>=4?.6:-.6),0,(2-row)*2.25+1.3)}
 chair(seat){let g=new THREE.Group(),p=this.seatPosition(seat);g.position.copy(p);g.add(this.box(this.materials.wood,1.15,.15,.9,0,.65,0));g.add(this.box(this.materials.frame,1.12,.6,.13,0,1.03,-.38));for(let x of [-.43,.43])for(let z of [-.3,.3])g.add(this.box(this.materials.frame,.09,.65,.09,x,.3,z));return g}
 orb(mat,x,y,z,w,h=w,d=w){let mesh=new THREE.Mesh(this.sphereGeometry,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);return mesh}
 decorate(){
  // Soft toy-like scenery, all built locally without external model downloads.
  for(let x of [-10.6,10.6])for(let z of [-5,2,8]){let tree=new THREE.Group();tree.position.set(x,0,z);tree.add(this.box(this.materials.wood,.2,1,.2,0,.5,0));for(let [dx,dy] of [[0,1.6],[-.35,1.35],[.35,1.35]])tree.add(this.orb(this.materials.mint,dx,dy,0,.65));tree.add(this.orb(this.materials.pink,.1,1.55,.54,.12));this.scene.add(tree)}
  for(let i=0;i<6;i++){let cloud=new THREE.Group();cloud.position.set((i-2.5)*3.8,2.5+(i%2)*.5,-6.2);for(let j=-1;j<=1;j++)cloud.add(this.orb(this.materials.white,j*.38,Math.abs(j)*-.1,0,.5,.35,.22));this.scene.add(cloud)}
  for(let i=0;i<40;i++){let p=this.seatPosition(i);let rug=this.orb(i%2?this.materials.pink:this.materials.yellow,p.x,.015,p.z,.82,.025,.72);this.scene.add(rug)}
 }
 avatar(id){let group=new THREE.Group(),seed=0;for(let c of id)seed=(seed*31+c.charCodeAt(0))>>>0;let color=['#ffca70','#80cbbb','#b9a1e3','#f3a4ba','#89b7ed','#b4cf79'][seed%6],shirt=new THREE.MeshStandardMaterial({color,roughness:.55});
  group.add(this.orb(shirt,0,1.02,0,.37,.43,.28));
  group.add(this.orb(this.materials.skin,0,1.76,0,.43,.44,.38));
  group.add(this.orb(this.materials.hair,0,2.01,-.035,.45,.24,.39));
  for(let x of [-.17,.17]){group.add(this.orb(this.materials.white,x,1.8,.345,.085,.1,.045));group.add(this.orb(this.materials.hair,x,1.79,.384,.05,.067,.02));group.add(this.orb(this.materials.white,x-.013,1.82,.403,.018));group.add(this.orb(this.materials.cheek,x*1.55,1.64,.32,.09,.043,.025))}
  // A smiling mouth and a tiny nose make faces readable from the camera.
  group.add(this.orb(this.materials.cheek,0,1.59,.365,.09,.055,.02));group.add(this.orb(this.materials.white,0,1.615,.383,.065,.016,.009));group.add(this.orb(this.materials.skin,0,1.71,.39,.048));
  if(seed%2)for(let x of [-.43,.43]){group.add(this.orb(this.materials.hair,x,1.92,-.06,.17,.22,.17));group.add(this.orb(this.materials.pink,x,2.04,.05,.1,.065,.07))}
  else{group.add(this.orb(this.materials.yellow,.23,2.14,.18,.12,.09,.08))}
  let arms=[];for(let x of [-.42,.42]){let arm=this.orb(shirt,x,1.05,0,.13,.3,.14);group.add(arm);arms.push(arm);group.add(this.orb(this.materials.skin,x,.79,.02,.12,.13,.11))}
  let legs=[];for(let x of [-.17,.17]){let leg=this.orb(this.materials.pants,x,.5,0,.14,.34,.15);group.add(leg);legs.push(leg);group.add(this.orb(this.materials.white,x,.23,.1,.17,.12,.24))}
  group.add(this.orb(this.materials.yellow,0,1.13,.275,.07,.07,.02));return{group,legs,arms,shirt}
 }
 update(participants,self){let incoming=new Map(participants.filter(p=>p.online).map(p=>[p.id,p]));for(let [id,obj] of this.people){if(!incoming.has(id)&&!obj.leaving){obj.leaving=true;obj.group.position.y=0;obj.path=[new THREE.Vector3(-10,0,obj.group.position.z),new THREE.Vector3(-12,0,9)];obj.pathIndex=0;obj.seated=false}}
  for(let [id,p] of incoming){let obj=this.people.get(id);if(!obj){obj=this.avatar(id);obj.group.position.set(-12,0,9);obj.seat=p.seat;obj.seated=false;obj.leaving=false;let target=this.seatPosition(p.seat);obj.path=[new THREE.Vector3(-10,0,target.z),target];obj.pathIndex=0;this.people.set(id,obj);this.scene.add(obj.group);let label=document.createElement('span');label.className='mia-avatar-name'+(id===self?' self':'');label.textContent=p.name;this.overlay.appendChild(label);this.labels.set(id,label)}else if(obj.leaving){obj.leaving=false;obj.seated=false;obj.path=[this.seatPosition(p.seat)];obj.pathIndex=0}let label=this.labels.get(id);if(label)label.textContent=p.name}
 }
 resize(){let w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();let scale=1;
  // Fit the full seating area and name labels at every aspect ratio.
  for(let i=0;i<35;i++){this.camera.position.set(0,10*scale,13*scale+1.3);this.camera.lookAt(0,.8,1.3);this.camera.updateMatrixWorld();let fits=true;for(let x of [-9.5,9.5])for(let y of [0,2.7])for(let z of [-4.1,6.8]){let v=new THREE.Vector3(x,y,z).project(this.camera);if(Math.abs(v.x)>.94||Math.abs(v.y)>.86)fits=false}if(fits)break;scale*=1.045}
 }
 animate(t){if(this.disposed)return;let dt=Math.min((t-this.last)/1000,.2);this.last=t;
  for(let [id,obj] of this.people){let target=obj.path[obj.pathIndex];if(target){let delta=target.clone().sub(obj.group.position);delta.y=0;let distance=delta.length();if(distance<.08){obj.pathIndex++;if(obj.pathIndex>=obj.path.length){if(obj.leaving){this.scene.remove(obj.group);obj.shirt.dispose();this.labels.get(id)?.remove();this.labels.delete(id);this.people.delete(id);continue}obj.seated=true;obj.group.rotation.y=0;obj.group.position.y=-.15;obj.legs.forEach(l=>l.rotation.x=-.65)}}else{let direction=delta.normalize();obj.group.position.addScaledVector(direction,Math.min(distance,dt*4.2));obj.group.rotation.y=Math.atan2(direction.x,direction.z);obj.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*.013+i*Math.PI)*.4);obj.arms.forEach((l,i)=>l.rotation.x=Math.sin(t*.013+i*Math.PI)*.3)}}
   let position=obj.group.position.clone().add(new THREE.Vector3(0,2.35,0)).project(this.camera),label=this.labels.get(id);if(label){label.style.left=((position.x*.5+.5)*this.container.clientWidth)+'px';label.style.top=((-position.y*.5+.5)*this.container.clientHeight)+'px';label.style.display=position.z<1?'block':'none'}
  }
  this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(this.animate)
 }
 destroy(){this.disposed=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();for(let p of this.people.values())p.shirt.dispose();this.people.clear();this.boxGeometry.dispose();this.sphereGeometry.dispose();this.cylinderGeometry.dispose();Object.values(this.materials).forEach(m=>m.dispose());this.renderer.dispose();this.renderer.domElement.remove();this.overlay.remove()}
}

import * as THREE from './assets/vendor/three.module.min.js';
export class Classroom3D {
 constructor(container){
  this.container=container;this.people=new Map();this.labels=new Map();this.disposed=false;this.last=performance.now();
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#e7eedb');this.scene.fog=new THREE.Fog('#e7eedb',22,48);
  this.camera=new THREE.PerspectiveCamera(35,1,.1,70);this.camera.position.set(0,8.5,11.5);this.camera.lookAt(0,.4,1.2);
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.outputColorSpace=THREE.SRGBColorSpace;container.appendChild(this.renderer.domElement);
  this.overlay=document.createElement('div');this.overlay.className='mia-avatar-labels';container.appendChild(this.overlay);
  this.scene.add(new THREE.HemisphereLight(0xffffff,0x8eab72,2.3));let sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-5,12,6);this.scene.add(sun);
  this.boxGeometry=new THREE.BoxGeometry(1,1,1);this.sphereGeometry=new THREE.SphereGeometry(1,12,10);this.cylinderGeometry=new THREE.CylinderGeometry(1,1,1,10);
  this.materials={floor:new THREE.MeshStandardMaterial({color:'#d1ddbc',roughness:.9}),wood:new THREE.MeshStandardMaterial({color:'#dcb780',roughness:.7}),frame:new THREE.MeshStandardMaterial({color:'#4a6b55'}),skin:new THREE.MeshStandardMaterial({color:'#f0be91'}),hair:new THREE.MeshStandardMaterial({color:'#49382c'}),pants:new THREE.MeshStandardMaterial({color:'#345463'})};
  let floor=this.box(this.materials.floor,24,.12,23,0,-.1,1);this.scene.add(floor);
  for(let i=0;i<40;i++)this.scene.add(this.chair(i));
  let aisle=this.box(new THREE.MeshStandardMaterial({color:'#e6eccf'}),1.2,.02,18,0,.01,1);this.scene.add(aisle);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();this.animate=this.animate.bind(this);this.raf=requestAnimationFrame(this.animate)
 }
 box(mat,w,h,d,x,y,z){let m=new THREE.Mesh(this.boxGeometry,mat);m.scale.set(w,h,d);m.position.set(x,y,z);return m}
 seatPosition(seat){let row=Math.floor(seat/8),col=seat%8;return new THREE.Vector3((col-3.5)*2.15+(col>=4?.6:-.6),0,(row-2)*2.25+1.3)}
 chair(seat){let g=new THREE.Group(),p=this.seatPosition(seat);g.position.copy(p);g.add(this.box(this.materials.wood,1.15,.15,.9,0,.65,0));g.add(this.box(this.materials.frame,1.12,.6,.13,0,1.03,.38));for(let x of [-.43,.43])for(let z of [-.3,.3])g.add(this.box(this.materials.frame,.09,.65,.09,x,.3,z));return g}
 avatar(id){let group=new THREE.Group(),seed=0;for(let c of id)seed=(seed*31+c.charCodeAt(0))>>>0;let color=['#efba58','#76a8a0','#b390c7','#dc8e7d','#6a94be','#8eb56c'][seed%6],shirt=new THREE.MeshStandardMaterial({color});
  let body=this.box(shirt,.63,.64,.38,0,1.13,0);group.add(body);let head=new THREE.Mesh(this.sphereGeometry,this.materials.skin);head.scale.set(.3,.33,.29);head.position.set(0,1.75,-.02);group.add(head);let hair=new THREE.Mesh(this.sphereGeometry,this.materials.hair);hair.scale.set(.31,.19,.3);hair.position.set(0,1.94,.02);group.add(hair);
  for(let x of [-.13,.13]){let eye=new THREE.Mesh(this.sphereGeometry,this.materials.hair);eye.scale.set(.027,.033,.027);eye.position.set(x,1.78,-.29);group.add(eye)}
  let arms=[];for(let x of [-.42,.42]){let arm=this.box(shirt,.18,.58,.22,x,1.13,0);group.add(arm);arms.push(arm);let hand=new THREE.Mesh(this.sphereGeometry,this.materials.skin);hand.scale.set(.1,.12,.1);hand.position.set(x,.82,0);group.add(hand)}
  let legs=[];for(let x of [-.17,.17]){let leg=this.box(this.materials.pants,.24,.67,.26,x,.52,0);group.add(leg);legs.push(leg)}
  return {group,legs,arms,shirt}
 }
 update(participants,self){let incoming=new Map(participants.filter(p=>p.online).map(p=>[p.id,p]));for(let [id,obj] of this.people){if(!incoming.has(id)&&!obj.leaving){obj.leaving=true;obj.group.position.y=0;obj.path=[new THREE.Vector3(-10,0,obj.group.position.z),new THREE.Vector3(-12,0,9)];obj.pathIndex=0;obj.seated=false}}
  for(let [id,p] of incoming){let obj=this.people.get(id);if(!obj){obj=this.avatar(id);obj.group.position.set(-12,0,9);obj.seat=p.seat;obj.seated=false;obj.leaving=false;let target=this.seatPosition(p.seat);obj.path=[new THREE.Vector3(-10,0,target.z),target];obj.pathIndex=0;this.people.set(id,obj);this.scene.add(obj.group);let label=document.createElement('span');label.className='mia-avatar-name'+(id===self?' self':'');label.textContent=p.name;this.overlay.appendChild(label);this.labels.set(id,label)}else if(obj.leaving){obj.leaving=false;obj.seated=false;obj.path=[this.seatPosition(p.seat)];obj.pathIndex=0}let label=this.labels.get(id);if(label)label.textContent=p.name}
 }
 resize(){let w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;let scale=Math.max(1,2.4/this.camera.aspect);this.camera.position.set(0,8.5*scale,10.3*scale+1.2);this.camera.lookAt(0,.4,1.2);this.camera.updateProjectionMatrix()}
 animate(t){if(this.disposed)return;let dt=Math.min((t-this.last)/1000,.05);this.last=t;
  for(let [id,obj] of this.people){let target=obj.path[obj.pathIndex];if(target){let delta=target.clone().sub(obj.group.position);delta.y=0;let distance=delta.length();if(distance<.08){obj.pathIndex++;if(obj.pathIndex>=obj.path.length){if(obj.leaving){this.scene.remove(obj.group);obj.shirt.dispose();this.labels.get(id)?.remove();this.labels.delete(id);this.people.delete(id);continue}obj.seated=true;obj.group.rotation.y=0;obj.group.position.y=-.15;obj.legs.forEach(l=>l.rotation.x=-.65)}}else{let direction=delta.normalize();obj.group.position.addScaledVector(direction,Math.min(distance,dt*4.2));obj.group.rotation.y=Math.atan2(-direction.x,-direction.z);obj.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*.013+i*Math.PI)*.4);obj.arms.forEach((l,i)=>l.rotation.x=Math.sin(t*.013+i*Math.PI)*.3)}}
   let position=obj.group.position.clone().add(new THREE.Vector3(0,2.35,0)).project(this.camera),label=this.labels.get(id);if(label){label.style.left=((position.x*.5+.5)*this.container.clientWidth)+'px';label.style.top=((-position.y*.5+.5)*this.container.clientHeight)+'px';label.style.display=position.z<1?'block':'none'}
  }
  this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(this.animate)
 }
 destroy(){this.disposed=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();for(let p of this.people.values())p.shirt.dispose();this.people.clear();this.boxGeometry.dispose();this.sphereGeometry.dispose();this.cylinderGeometry.dispose();Object.values(this.materials).forEach(m=>m.dispose());this.renderer.dispose();this.renderer.domElement.remove();this.overlay.remove()}
}

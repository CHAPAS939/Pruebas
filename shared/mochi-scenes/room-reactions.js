/* Small visual reactions never change the real task state or saved activity. */
(() => {
 function create(){let id=0,started=0;
  return {sample(settings,time,seat,roots){
   const reaction=settings.reaction;if(reaction&&reaction.id!==id){id=reaction.id;started=time}
   const none={position:seat,yaw:null,happy:false,walking:false,kind:'none'};
   if(!reaction||settings.reduceMotion||settings.portrait||!['idle','finished'].includes(settings.state))return none;
   const elapsed=Math.max(0,time-started);
   if(reaction.kind==='celebrate')return elapsed<2200?{...none,happy:true,kind:'celebrate'}:none;
   const target=roots[reaction.target];if(!target||target.visible===false||elapsed>=4000)return none;
   const z=Math.min(2,Math.max(-2,target.position.z+.95)),x=Math.max(-3,Math.min(3,target.position.x)),t=elapsed/4000;
   const travel=t<.25?t/.25:t>.65?(1-t)/.35:1,blend=1-Math.pow(1-Math.max(0,Math.min(1,travel)),3);
   const position=[seat[0]+(x-seat[0])*blend,seat[1]+(.72-seat[1])*blend+Math.sin(Math.PI*blend)*.32,seat[2]+(z-seat[2])*blend];
   return{position,yaw:Math.atan2(target.position.x-position[0],target.position.z-position[2]),happy:false,walking:t<.25||t>.65,kind:'explore'};
  }};
 }
 if(typeof module==='object'&&module.exports)module.exports=create;else window.createMochiReactions=create;
})();

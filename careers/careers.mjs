export function filterJobs(jobs,{q='',location='',type='',category='',recruitment=''}={}){
 const keyword=q.trim().toLocaleLowerCase();
 return jobs.filter(job=>(!keyword||(job.title+' '+job.description).toLocaleLowerCase().includes(keyword))&&(!location||job.location===location)&&(!type||job.type===type)&&(!category||job.category===category)&&(!recruitment||job.recruitment===recruitment));
}

if(typeof document!=='undefined'){
 const $=selector=>document.querySelector(selector);
 const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
 let jobs=[],recruitment='实习生';
 const controls={location:$('#job-location'),type:$('#job-type'),category:$('#job-category')};
 function updateOptions(){
  for(const [key,select]of Object.entries(controls)){
   select.replaceChildren(select.options[0]);
   for(const value of [...new Set(jobs.filter(job=>job.recruitment===recruitment).map(job=>job[key]).filter(Boolean))].sort()){
    const option=el('option',value);option.value=value;select.append(option);
   }
   select.disabled=select.options.length===1;
  }
 }
 function render(){
  const selected={recruitment,q:$('#job-search').value,...Object.fromEntries(Object.entries(controls).map(([key,node])=>[key,node.value]))};
  const result=filterJobs(jobs,selected);$('#job-count').textContent=`${result.length} 个职位`;$('#jobs-list').replaceChildren();
  $('#jobs-empty').hidden=result.length>0;
  $('#empty-title').textContent=jobs.length?'没有符合条件的职位':'职位即将发布';
  $('#empty-description').textContent=jobs.length?'请尝试其他关键词，或清除筛选条件查看全部职位。':'当前暂无公开招聘职位。欢迎关注后续更新，或通过官方邮箱了解未来的加入机会。';
  for(const job of result){
   const card=el('details',undefined,'job-card panel'),summary=el('summary');
   summary.append(el('h3',job.title),el('p',[job.location||'地点待沟通',job.recruitment,job.category].filter(Boolean).join(' · '),'job-meta'));
   const apply=el('a','邮件申请 ↗','careers-button');apply.href='mailto:dylanzhang@veloxisai.com?subject='+encodeURIComponent('应聘：'+job.recruitment+' · '+job.title);
   card.append(summary,el('p',job.description,'job-description'),apply);$('#jobs-list').append(card);
  }
  $('#latest-jobs').replaceChildren();
  const quickJobs=jobs.filter(job=>job.recruitment===recruitment).slice(0,5);
  if(!quickJobs.length)$('#latest-jobs').append(el('p','暂无职位','muted'));
  for(const job of quickJobs){
   const link=el('a',job.title);link.href='#jobs-list';link.addEventListener('click',()=>{$('#job-filters').reset();$('#job-search').value=job.title;render();$('#jobs-list summary')?.focus();});$('#latest-jobs').append(link);
  }
 }
 async function load(){
  try{
   const response=await fetch('jobs.json',{cache:'no-cache'});if(!response.ok)throw Error('Jobs unavailable');
   const data=await response.json();if(!Array.isArray(data)||data.some(job=>!job.title||typeof job.description!=='string'))throw Error('Invalid jobs');
   jobs=data;
   updateOptions();
   for(const button of document.querySelectorAll('[data-recruitment]')){
    button.querySelector('span').textContent=jobs.filter(job=>job.recruitment===button.dataset.recruitment).length;
    button.addEventListener('click',()=>{
     recruitment=button.dataset.recruitment;$('#job-filters').reset();updateOptions();
     for(const tab of document.querySelectorAll('[data-recruitment]'))tab.setAttribute('aria-pressed',String(tab===button));
     render();
    });
   }
   $('#job-filters').addEventListener('submit',event=>event.preventDefault());
   $('#job-filters').addEventListener('input',render);
   $('#clear-filters').addEventListener('click',()=>{$('#job-filters').reset();render();});
   render();
  }catch{
   $('#job-count').textContent='暂不可用';$('#jobs-empty').hidden=false;
   $('#empty-title').textContent='职位列表暂时无法加载';$('#empty-description').textContent='请稍后刷新页面，或通过官方邮箱咨询招聘信息。';
   $('#latest-jobs').replaceChildren(el('p','暂时无法加载','muted'));
  }finally{$('#jobs-list').setAttribute('aria-busy','false');}
 }
 load();
}

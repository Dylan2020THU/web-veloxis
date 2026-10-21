import test from 'node:test';
import assert from 'node:assert/strict';
import {filterJobs} from '../../careers/careers.mjs';

// Test fixtures only; these are not published openings.
const jobs=[
 {title:'算法工程师',location:'北京',type:'全职',category:'研发',recruitment:'社会招聘',description:'人工智能算法研究'},
 {title:'技术教学助理',location:'上海',type:'实习',category:'教学',recruitment:'实习生',description:'AI 项目实践'}
];
test('an unpublished jobs list stays empty',()=>assert.deepEqual(filterJobs([],{}),[]));
test('keyword search covers titles and descriptions without case sensitivity',()=>{
 assert.equal(filterJobs(jobs,{q:'  ai  '})[0].title,'技术教学助理');
 assert.equal(filterJobs(jobs,{q:'算法'}).length,1);
 assert.equal(filterJobs(jobs,{q:'不存在'}).length,0);
});
test('recruitment channels isolate internships from full-time positions and compose with search',()=>{
 assert.equal(filterJobs(jobs,{recruitment:'实习生'}).length,1);
 assert.equal(filterJobs(jobs,{recruitment:'校园招聘'}).length,0);
 assert.equal(filterJobs(jobs,{recruitment:'社会招聘',q:'教学'}).length,0);
});
test('location, employment type and function combine rather than overwrite one another',()=>{
 assert.equal(filterJobs(jobs,{location:'北京',type:'实习'}).length,0);
 assert.equal(filterJobs(jobs,{location:'上海',type:'实习',category:'教学'}).length,1);
 assert.equal(filterJobs(jobs,{}).length,2);
});

let goals = JSON.parse(localStorage.getItem('goals')) || [];
// Миграция старых целей без подцелей
goals.forEach(g => { if (!g.subgoals) g.subgoals = []; });
let currentFilter = 'all';
const goalList = document.getElementById('goalList');
const goalInput = document.getElementById('goalInput');
const categorySelect = document.getElementById('categorySelect');
const addGoalBtn = document.getElementById('addGoalBtn');
const totalGoals = document.getElementById('totalGoals');
const completedGoals = document.getElementById('completedGoals');
const progressPercent = document.getElementById('progressPercent');
const filterBtns = document.querySelectorAll('.filter-btn');
// Круг прогресса удалён
function saveGoals(){ localStorage.setItem('goals', JSON.stringify(goals)); }
function updateStats(){ const total = goals.length; const completed = goals.filter(g=>g.completed).length; totalGoals.textContent=total; completedGoals.textContent=completed; }
function renderGoals(){
	goalList.innerHTML='';
	goals.forEach((goal,index)=>{
		if(currentFilter==='completed' && !goal.completed) return;
		if(currentFilter==='active' && goal.completed) return;
		const li=document.createElement('li');
		li.setAttribute('draggable',true);
		if(goal.completed) li.classList.add('completed');
		const categorySpan=document.createElement('span');
		categorySpan.textContent=goal.category;
		categorySpan.classList.add('category-label',`category-${goal.category}`);
		const textSpan=document.createElement('span');
		textSpan.textContent=goal.text;
		const btnGroup=document.createElement('div');
		const completeBtn=document.createElement('button');
		completeBtn.textContent=goal.completed?'Відновити':'Завершено';
		completeBtn.classList.add('complete-btn');
		completeBtn.onclick=()=>{ goals[index].completed=!goals[index].completed; saveGoals(); renderGoals(); updateStats(); };
		const deleteBtn=document.createElement('button');
		deleteBtn.textContent='Видалити';
		deleteBtn.classList.add('delete-btn');
		deleteBtn.onclick=()=>{ goals.splice(index,1); saveGoals(); renderGoals(); updateStats(); };
		btnGroup.appendChild(completeBtn);
		btnGroup.appendChild(deleteBtn);
		li.appendChild(categorySpan);
		li.appendChild(textSpan);
		li.appendChild(btnGroup);

		// --- Подцели ---
		const subgoalsList = document.createElement('ul');
		subgoalsList.className = 'subgoals-list';
		goal.subgoals.forEach((sub, subIdx) => {
			const subLi = document.createElement('li');
			subLi.className = 'subgoal-item' + (sub.completed ? ' completed' : '');
			const subText = document.createElement('span');
			subText.className = 'subgoal-text';
			subText.textContent = sub.text;
			const subBtnGroup = document.createElement('div');
			const completeSubBtn = document.createElement('button');
			completeSubBtn.textContent = sub.completed ? 'Відновити' : 'Завершено';
			completeSubBtn.className = 'complete-subgoal-btn';
			completeSubBtn.onclick = () => {
				goal.subgoals[subIdx].completed = !goal.subgoals[subIdx].completed;
				saveGoals();
				renderGoals();
			};
			const deleteSubBtn = document.createElement('button');
			deleteSubBtn.textContent = 'Видалити';
			deleteSubBtn.className = 'delete-subgoal-btn';
			deleteSubBtn.onclick = () => {
				goal.subgoals.splice(subIdx,1);
				saveGoals();
				renderGoals();
			};
			subBtnGroup.appendChild(completeSubBtn);
			subBtnGroup.appendChild(deleteSubBtn);
			subLi.appendChild(subText);
			subLi.appendChild(subBtnGroup);
			subgoalsList.appendChild(subLi);
		});
		// Форма добавления подцели
		const addSubForm = document.createElement('form');
		addSubForm.className = 'add-subgoal-form';
		addSubForm.onsubmit = (e) => {
			e.preventDefault();
			const input = addSubForm.querySelector('input');
			const val = input.value.trim();
			if(val){
				goal.subgoals.push({text: val, completed: false});
				saveGoals();
				renderGoals();
			}
			input.value = '';
		};
		const addSubInput = document.createElement('input');
		addSubInput.type = 'text';
		addSubInput.placeholder = 'Додати підціль...';
		addSubInput.className = 'add-subgoal-input';
		const addSubBtn = document.createElement('button');
		addSubBtn.type = 'submit';
		addSubBtn.textContent = '+';
		addSubBtn.className = 'add-subgoal-btn';
		addSubForm.appendChild(addSubInput);
		addSubForm.appendChild(addSubBtn);
		// Добавить список и форму подцелей к цели
		li.appendChild(subgoalsList);
		li.appendChild(addSubForm);

		goalList.appendChild(li);
		li.addEventListener('dragstart',()=>li.classList.add('dragging'));
		li.addEventListener('dragend',()=>li.classList.remove('dragging'));
	});
	// drag&drop
	const draggables=document.querySelectorAll('li');
	draggables.forEach(draggable=>{
		draggable.addEventListener('dragover',e=>{
			e.preventDefault();
			const dragging=document.querySelector('.dragging');
			if(dragging===draggable) return;
			const all=[...goalList.children];
			const indexDragged=all.indexOf(dragging);
			const indexOver=all.indexOf(draggable);
			goalList.insertBefore(dragging,indexDragged<indexOver?draggable.nextSibling:draggable);
			const temp=goals.splice(indexDragged,1)[0];
			goals.splice(indexOver,0,temp);
			saveGoals();
		});
	});
}
addGoalBtn.addEventListener('click',()=>{ const text=goalInput.value.trim(); const category=categorySelect.value; if(text){ goals.push({text,category,completed:false}); saveGoals(); renderGoals(); updateStats(); goalInput.value=''; } });
goalInput.addEventListener('keypress',(e)=>{ if(e.key==='Enter') addGoalBtn.click(); });
filterBtns.forEach(btn=>{ btn.addEventListener('click',()=>{ currentFilter=btn.dataset.filter; renderGoals(); }); });
renderGoals(); updateStats();
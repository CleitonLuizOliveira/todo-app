import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
// import { withAuthenticator } from '@aws-amplify/ui-react';

import './App.css';

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const App = () => {
  const [taskName, setTaskName] = useState('');
  const [todos, setTodos] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [undoneTasks, setUndoneTasks] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, [])

  useEffect(() => {
    setDoneTasks(todos.filter(todo => todo.checked === true));
    setUndoneTasks(todos.filter(todo => todo.checked === false));
  }, [todos]);

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!taskName) return;
      const todo = { name: taskName, checked: false };
      setTodos([...todos, todo]);
      setTaskName('');
      await API.graphql(graphqlOperation(createTodo, {input: todo}));
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  function checkTodo(todo) {
    const newTodos = todos.map(element => {
      if (element.name === todo.name) {
        element.checked = !element.checked;
      }
      return element;
    });
    setTodos(newTodos);
  }

  function removeTodo(todo) {
    const newTodos = todos.filter(element => element.name !== todo.name);
    setTodos(newTodos);
  }

  return (
    <main>
      <h2>My Tasks</h2>
      <input
        onChange={event => setTaskName(event.target.value)}
        value={taskName}
        placeholder="Describe your task here"
        onKeyUp={event => event.keyCode === 13 ? addTodo() : null}
      />
      <button onClick={addTodo} className="todo_button">Create Task</button>
      <div className="tasks_todo task_list">
        {
          undoneTasks.map((todo, index) => (
            <div key={todo.id ? todo.id : index}>
              <legend onClick={() => checkTodo(todo)}>{todo.name}</legend>
              <button onClick={() => removeTodo(todo)}>x</button>
            </div>
            
          ))
        }
      </div>
      <div className="done_tasks task_list">
      {
        doneTasks.map((todo, index) => (
          <div key={todo.id ? todo.id : index}>
            <legend onClick={() => checkTodo(todo)}>{todo.name}</legend>
            <button onClick={() => removeTodo(todo)}>x</button>
          </div>
          
        ))
      }
      </div>
      
    </main>
  )
}

// export default withAuthenticator(App);
export default App;

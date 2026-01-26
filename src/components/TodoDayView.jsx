import React from 'react';
import PropTypes from 'prop-types';
import TodoItem from './TodoItem';

const TodoDayView = ({ todos, date }) => {
  if (!todos || !date) {
    console.error('Invalid props supplied to TodoDayView');
    return null;
  }

  const filteredTodos = todos.filter(todo => new Date(todo.date).toDateString() === date.toDateString());

  return (
    <div className="todo-day-view p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Todos for {date.toDateString()}</h2>
      {filteredTodos.length > 0 ? (
        <ul>
          {filteredTodos.map(todo => (
            <li key={todo.id} className="mb-2">
              <TodoItem todo={todo} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No tasks for this day.</p>
      )}
    </div>
  );
};

TodoDayView.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired
    })
  ).isRequired,
  date: PropTypes.instanceOf(Date).isRequired
};

export default TodoDayView;

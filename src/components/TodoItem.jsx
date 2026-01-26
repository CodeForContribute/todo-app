import React from 'react';
import PropTypes from 'prop-types';

const TodoItem = ({ todo }) => {
  return (
    <div className="todo-item p-2 border rounded-lg flex justify-between items-center">
      <span className={todo.completed ? 'line-through text-gray-500' : ''}>
        {todo.title}
      </span>
    </div>
  );
};

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired
  }).isRequired
};

export default TodoItem;

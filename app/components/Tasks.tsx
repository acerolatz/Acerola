import CreateTodoComponent from './CreateTodoComponent'
import { FlatList, StyleSheet } from 'react-native'
import TodoComponent from './TodoComponent'
import React, { useCallback } from 'react'
import { Todo } from '@/helpers/types'
import Footer from './util/Footer'


interface TasksProps {
    todos: Todo[]
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}


const Tasks = ({todos, setTodos}: TasksProps) => {

    const KeyExtractor = useCallback((item: Todo) => item.todo_id.toString(), [])

    const renderItem = useCallback(
        ({item}: {item: Todo}) => <TodoComponent todo={item} setTodos={setTodos} />,
        []
    )

    return (
        <FlatList
            data={todos}
            keyExtractor={KeyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps='always'
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<CreateTodoComponent setTodos={setTodos} />}
            ListFooterComponent={<Footer/>}
        />
    )
}


export default Tasks

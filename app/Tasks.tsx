import { FlatList, StyleSheet } from 'react-native'
import React from 'react'
import { Todo } from '@/helpers/types'
import TodoComponent from './components/TodoComponent'
import CreateTodoComponent from './components/CreateTodoComponent'
import Footer from './components/util/Footer'


interface TasksProps {
    todos: Todo[]
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}

const Tasks = ({todos, setTodos}: TasksProps) => {

    return (
        <FlatList
            data={todos}
            keyExtractor={(item) => item.todo_id.toString()}
            renderItem={({item}) => <TodoComponent todo={item} setTodos={setTodos} />}
            keyboardShouldPersistTaps='always'
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<CreateTodoComponent setTodos={setTodos} />}
            ListFooterComponent={<Footer/>}
        />
    )
}

export default Tasks

const styles = StyleSheet.create({})
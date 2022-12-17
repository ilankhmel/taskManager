const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId
const { execute } = require('../../services/execute.service')

async function query(filterBy={txt:''}) {
    console.log(filterBy.txt);
    try {
        var criteria = {
            $text: { $search: filterBy.txt }
            // title: { $regex: filterBy.txt, $options: 'i' }
        }

        if(!filterBy.txt) criteria = {}

        const collection = await dbService.getCollection('task')
        collection.createIndex( { title: "text" } )
        var tasks = await collection.find(criteria).toArray()
        return tasks
    } catch (err) {
        logger.error('cannot find tasks', err)
        throw err
    }
}

async function getById(taskId) {
    try {
        const collection = await dbService.getCollection('task')
        const task = collection.findOne({ _id: ObjectId(taskId) })
        return task
    } catch (err) {
        logger.error(`while finding task ${taskId}`, err)
        throw err
    }
}

async function remove(taskId) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.deleteOne({ _id: ObjectId(taskId) })
        return taskId
    } catch (err) {
        logger.error(`cannot remove task ${taskId}`, err)
        throw err
    }
}

async function add(task) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.insertOne(task)
        return task
    } catch (err) {
        logger.error('cannot insert task', err)
        throw err
    }
}

async function update(task) {
    try {
        const taskToSave = {
            title: task.title,
            description: task.description,
            lastTriedAt: task.lastTriedAt,
            triesCount: task.triesCount,
            doneAt: task.doneAt,
            errors: task.errors,
            status: task.status,
        }
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(task._id) }, { $set: taskToSave })
        return task
    } catch (err) {
        logger.error(`cannot update task ${taskId}`, err)
        throw err
    }
}

async function addTaskMsg(taskId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(taskId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add task msg ${taskId}`, err)
        throw err
    }
}

async function removeTaskMsg(taskId, msgId) {
    try {
        const collection = await dbService.getCollection('task')
        await collection.updateOne({ _id: ObjectId(taskId) }, { $pull: { msgs: {id: msgId} } })
        return msgId
    } catch (err) {
        logger.error(`cannot add task msg ${taskId}`, err)
        throw err
    }
}

async function performTask(task) {
    try {
    // TODO: update task status to running and save to DB
    task.status = "Running"
    await update(task)
    // TODO: execute the task using: externalService.execute
    const result = await execute(task)
    // TODO: update task for success (doneAt, status)
    task.doneAt = Date.now()
    task.status = "Done"
} catch (error) {
    console.log(error);
    // TODO: update task for error: status, errors
    task.status = "Fail"
    task.errors.unshift(error)
    
} finally {
    // TODO: update task lastTried, triesCount and save to DB
    task.lastTriedAt = Date.now()
    // console.log(task.triesCount);
    task.triesCount = +task.triesCount + 1

    const updatedTask = await update(task)
    return updatedTask
    }
}
  
async function getNextTask(){
    const collection = await dbService.getCollection('task')
    var tasks = await collection.find({ triesCount: { $lt: 5 }, status: { $ne: 'Done'} }).sort({ "importance": -1, "triesCount": 1 } ).toArray()
    // console.log(tasks);
    return tasks[0]
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addTaskMsg,
    removeTaskMsg,
    performTask,
    getNextTask
}

// frontend/src/utils/db.js
import { openDB } from 'idb'

const DB_NAME = 'bananaDB'
const STORE_NAME = 'history'

// 初始化数据库
export const getDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

// 保存记录
export const saveHistory = async (record) => {
  const db = await getDB()
  await db.put(STORE_NAME, record)
  console.log('✅ 保存历史记录 ID=', record.id, ', 图片数量:', record.images.length)

  const allRecords = await db.getAll(STORE_NAME)
  console.log('📦 当前数据库总条数:', allRecords.length)
}

// 获取所有记录
export const getAllHistory = async () => {
  const db = await getDB()
  const records = await db.getAll(STORE_NAME)
  return records.sort((a, b) => b.id - a.id)
}

// 删除单条记录
export const deleteHistory = async (id) => {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

// 清空所有记录
export const clearAllHistory = async () => {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

/* global db print */
/* eslint no-restricted-globals: "off" */
const owners = ['Tedi', 'Betty', 'John', 'Clara', 'Samson'];
const statuses = ['New', 'Assigned', 'Fixed', 'Closed'];
const initialCount = db.buggs.count();
for (let i = 0; i < 100; i += 1) {
const randomCreatedDate = (new Date())
- Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
const created = new Date(randomCreatedDate);
const randomDueDate = (new Date())
- Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
const due = new Date(randomDueDate);
const owner = owners[Math.floor(Math.random() * 5)];
const status = statuses[Math.floor(Math.random() * 4)];
const effort = Math.ceil(Math.random() * 20);
const title = `Lorem ipsum dolor sit amet, ${i}`;
const id = initialCount + i + 1;
const bug = {
id, title, created, due, owner, status, effort,
};
db.buggs.insertOne(bug);
}
const count = db.buggs.count();
db.counters.update({ _id: 'buggs' }, { $set: { current: count } });
print('New bug count:', count);
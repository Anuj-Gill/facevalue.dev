//dll stands for Doubly linked list
export class ListNode<T> {
  data: T;
  next: ListNode<T> | null;
  prev: ListNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

export class DoublyLinkedList<T> {
  head: ListNode<T> | null;
  tail: ListNode<T> | null;
  length: number;

  constructor() {
    ((this.head = null), (this.tail = null), (this.length = 0));
  }

  addNodeToTail(node: ListNode<T>) {
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length++;
      return;
    }

    this.tail.next = node;
    node.prev = this.tail;
    this.length++;
  }

  removeHeadNode() {
    if (!this.head) {
      return;
    }

    if (!this.head.next) {
      this.head = null;
      this.tail = null;
      this.length = 0;
      return;
    }

    this.head = this.head.next;
    this.head.prev = null;
    this.length--;
  }

  isEmpty() {
    if(!this.head) {
      return true
    }
    return false
  }
}

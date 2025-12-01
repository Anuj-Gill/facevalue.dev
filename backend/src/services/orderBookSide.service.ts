import { Side } from "@prisma/client";
import { Order } from "./orderBook.service";
import { DoublyLinkedList, ListNode } from "./dll.service";

interface OrderLocation {
  price: number;
  node: ListNode<Order>;
}


export class OrderBookSide {
  private isBid: boolean;
  private _priceLevels: number[] = [];
  private _levelMap: Map<number, DoublyLinkedList<Order>> = new Map();
  private _orderMap: Map<string, OrderLocation> = new Map();

  constructor(isBid: boolean) {
    this.isBid = isBid;
  }

  removeOrderFromMap(id: string): void {
    this._orderMap.delete(id);
  }

  findInsertIndex(price: number, isBid: boolean) {
    let low = 0;
    let high = this.priceLevels.length - 1;
    let mid: number;
    const arr = this.priceLevels;
    while (low <= high) {
      mid = Math.floor(low + (high - low) / 2);
      if (isBid) {
        if (price > arr[mid]) high = mid - 1;
        else low = mid + 1;
      } else {
        if (price < arr[mid]) high = mid - 1;
        else low = mid + 1;
      }
    }
    return low;
  }

  addLimitOrder(order: Order): void {
    const price = order.price;
    let list = this._levelMap.get(price);
    if (!list) {
      const index = this.findInsertIndex(price, order.side == Side.buy);
      this._priceLevels.splice(index, 0, price);
      list = new DoublyLinkedList();
      this._levelMap.set(price, list);
    }
    const node = new ListNode(order);
    list.addNodeToTail(node);
    this._orderMap.set(order.id, { price, node });
  }

  get bestPrice(): number | undefined {
    return this._priceLevels[0];
  }

  get priceLevels(): number[] | null {
    return this._priceLevels
  }

  getHeadNodeAtPrice(price: number): ListNode<Order> | undefined {
    return this._levelMap.get(price)?.head;
  }

  // Removes the head order at given price and cleans up empty price levels
  removeHeadAtPrice(price: number): void {
    const list = this._levelMap.get(price);
    if (!list) return;

    list.removeHeadNode();

    // If no more orders at this price, remove the price level
    if (list.isEmpty()) {
      this._levelMap.delete(price);
      this._priceLevels.shift();
    }
  }

  // Check if there are any price levels
  hasPriceLevels(): boolean {
    return this._priceLevels.length > 0;
  }
}

import { storage, context, PersistentVector, ContractPromiseBatch, u128 } from "near-sdk-core"

// enum ItemState {
//     amountPresent,
//     orderPlaced,
// }

@nearBindgen
export class SmartRefrigerator {
    itemName: string;
    OrderPlaced: bool;
    itemAmount: u128;
    itemPrice: u128;
    itemTotalAllowed: u128;
    amountPresent: u128;
    vendor: string;
    // itemState: ItemState;

    constructor() {
        this.itemName = "None"
        this.itemAmount = u128.Zero
        this.itemPrice = u128.Zero
        this.OrderPlaced = false
        this.itemTotalAllowed = u128.from(20)
        this.amountPresent = context.attachedDeposit
        // this.itemState = ItemState.Created;
    }    
}

// new AccountId("vendor")

const items = new PersistentVector<SmartRefrigerator>("i")

export function createRefriergator(_itemName: string, _itemAmount: u128, _itemPrice: u128, _itemTotalAllowed: u128) {
    let newRefrigerator = new SmartRefrigerator()
    newRefrigerator.itemName = _itemName
    newRefrigerator.itemAmount = _itemAmount
    newRefrigerator.itemPrice = _itemPrice
    newRefrigerator.itemTotalAllowed = _itemTotalAllowed
    newRefrigerator.amountPresent = context.attachedDeposit
    items.push(newRefrigerator)
}

export function getItem(_index: u32): string {
    return items[_index].itemName
}

export function getItemAmount(_index: u32): u128 {
    return items[_index].itemAmount
}

export function getItemPrice(_index: u32): u128 {
    return items[_index].itemPrice
}

export function getItemTotalAllowed(_index: u32): u128 {
    return items[_index].itemTotalAllowed
}

// A function to check if there are enough items in the refrigerator; if not return the number of items that are missing
export function checkRefrigeratorForItem(_itemIndex: u32): bool {
    if (u128.fromitems[_itemIndex].itemAmount < u128.div(items[_itemIndex].itemTotalAllowed , u128.from(2))) {
        return true
    } else {
        return false
    }
}

// A function to add items to the refrigerator
export function addItems(_itemIndex: u32, _amountToAdd: u128): string {
    let totalAmountAfterAdding = u128.add(items[_itemIndex].itemAmount, _amountToAdd)
    items[_itemIndex].itemAmount = totalAmountAfterAdding
    return `✅ Items added to refrigerator.`
}

// A function to remove items from the refrigerator
export function removeItems(_itemIndex: u32, _amountToRemove: u128): string {
    let totalAmountAfterSubtracting = u128.sub(items[_itemIndex].itemAmount - _amountToRemove)
    items[_itemIndex].itemAmount = totalAmountAfterSubtracting
    return `✅ Items removed from refrigerator.`
}

// A function to place an order for groceries and transfers the required amount of item times the price of item to the vendor
export function placeOrder(_itemIndex: u32, _amountToBuy: u128): string {
    let itemsBought = new PersistentVector<u128>("itemsBought")
    // assert to check if enough money is attached to the account
    assert(context.attachedDeposit > u128.Zero), "Not enough money attached to account")
    
    addItems(_itemIndex, _amountToBuy)
    itemsBought.push(_itemIndex)

    let amountToTransfer = u128.mul(_amountToBuy, items[_itemIndex].itemPrice)
    const to_beneficiary = ContractPromiseBatch.create(context.sender)
    to_beneficiary.transfer(amountToTransfer)

    return `✅ Order placed.`
}

module.exports = {
  toQBD: customer => {
    const { qbdId, qbdFullName, qbdEditSequence, companyName, isActive, phone, addressBlock, resaleNumber, balance } = customer;

    const qbdCustomer = {};
    if (qbdId != null) qbdCustomer.ListID = qbdId;
    if (qbdFullName != null) qbdCustomer.FullName = qbdFullName;
    if (qbdEditSequence != null) qbdCustomer.EditSequence = qbdEditSequence;
    if (companyName != null) qbdCustomer.CompanyName = companyName;
    if (isActive != null) qbdCustomer.IsActive = isActive;
    if (phone != null) qbdCustomer.Phone = phone;
    if (addressBlock != null) {
      qbdCustomer.ShipAddressBlock = addressBlock.split('\n').reduce((ShipAddressBlock, ShipAddressLine, i) => {
        ShipAddressBlock[`Addr${i + 1}`] = ShipAddressLine;
      }, {})
    }
    if (resaleNumber != null) qbdCustomer.ResaleNumber = resaleNumber;
    if (balance != null) qbdCustomer.Balance = balance;

    return qbdCustomer;
  },
  fromQBD: qbdCustomer => {
    const { ListID, FullName, EditSequence, CompanyName, IsActive, Phone, ShipAddressBlock, ResaleNumber, Balance, TimeCreated, TimeModified } = qbdCustomer;

    const customer = {};
    customer.qbdId = ListID;
    customer.qbdFullName = FullName;
    customer.qbdEditSequence = EditSequence;
    customer.companyName = CompanyName || FullName;
    customer.isActive = IsActive;
    customer.phone = Phone;
    if (ShipAddressBlock) customer.addressBlock = Object.values(ShipAddressBlock).join('\n');
    customer.resaleNumber = ResaleNumber;
    customer.balance = Balance;
    customer.createdAt = new Date(TimeCreated);
    customer.updatedAt = new Date(TimeModified);

    return customer;
  }
}


module.exports = {
  toQBD: customer => {
    const { qbdId, qbdFullName, qbdEditSequence, companyName, isActive, phone, addressBlock, resaleNumber, balance } = customer;

    const qbdCustomer = {};
    if (qbdId != null) qbdCustomer.ListID = qbdId;
    if (qbdFullName != null) qbdCustomer.FullName = qbdFullName;
    if (qbdEditSequence != null) qbdCustomer.EditSequence = qbdEditSequence;
    if (isActive != null) qbdCustomer.IsActive = isActive;
    if (companyName != null) qbdCustomer.CompanyName = companyName;
    if (addressBlock != null) {
      qbdCustomer.ShipAddress = addressBlock.split('\n').reduce((ShipAddress, ShipAddressLine, i) => {
        ShipAddress[`Addr${i + 1}`] = ShipAddressLine;
        return ShipAddress;
      }, {})
    }
    if (phone != null) qbdCustomer.Phone = phone;
    if (resaleNumber != null) qbdCustomer.ResaleNumber = resaleNumber;

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

const dataExtConverter = (extName, extValue, listObjRefFullName) => {
    return {
    OwnerID: 0,
    DataExtName: extName.toUpperCase(),
    ListDataExtType: 'Item',
    ListObjRef: {
      FullName: listObjRefFullName
    },
    DataExtValue: extValue
  }
};

module.exports = {
  toQBD: itemInventory => {
    const { qbdId, qbdFullName, qbdEditSequence, name, isActive, description, price, category, imageUrl, brand } = itemInventory;

    const qbdItemInventory = {};
    if (qbdId != null) qbdItemInventory.ListID = qbdId;
    if (qbdFullName != null) qbdItemInventory.FullName = qbdFullName;
    if (qbdEditSequence != null) qbdItemInventory.EditSequence = qbdEditSequence;
    if (name != null) qbdItemInventory.Name = name;
    if (isActive != null) qbdItemInventory.IsActive = isActive;
    if (description != null) qbdItemInventory.SalesDesc = description;
    if (price != null) qbdItemInventory.SalesPrice = price;

    const DataExt = [];
    if (category != null) DataExt.push(dataExtConverter('CATEGORY', category, qbdFullName || name));
    if (imageUrl != null) DataExt.push(dataExtConverter('IMAGEURL', imageUrl, qbdFullName || name));
    if (brand != null) DataExt.push(dataExtConverter('BRAND', brand, qbdFullName || name));
    qbdItemInventory.DataExt = DataExt;

    return qbdItemInventory;
  },
  fromQBD: qbdItemInventory => {
    const { ListID, FullName, EditSequence, Name, IsActive, SalesDesc, SalesPrice, TimeCreated, TimeModified, DataExtRet } = qbdItemInventory;
    const customFields = [];
    if (DataExtRet) {
      if (Array.isArray(DataExtRet)) customFields.push(...DataExtRet);
      else customFields.push(DataExtRet);
    }

    const itemInventory = {};
    itemInventory.qbdId = ListID;
    itemInventory.qbdFullName = FullName;
    itemInventory.qbdEditSequence = EditSequence;
    itemInventory.name = Name;
    itemInventory.isActive = IsActive;
    itemInventory.description = SalesDesc;
    itemInventory.price = SalesPrice;
    itemInventory.createdAt = new Date(TimeCreated);
    itemInventory.updatedAt = new Date(TimeModified);


    customFields.forEach(customField => {
      const { DataExtName, DataExtValue } = customField;
      if (DataExtName === 'CATEGORY') itemInventory.category = DataExtValue;
      if (DataExtName === 'IMAGEURL') itemInventory.imageUrl = DataExtValue;
      if (DataExtName === 'BRAND') itemInventory.brand = DataExtValue;
    });

    return itemInventory;
  }
}

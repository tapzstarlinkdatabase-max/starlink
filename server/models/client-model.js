const mongoose = require("mongoose");
const clientSchema = new mongoose.Schema({
  companyName: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  phone01: {
    type: String,
  },
  phone02: {
    type: String,
  },
  phone03: {
    type: String,
  },
  telephone01: {
    type: String,
  },
  telephone02: {
    type: String,
  },
  telephone03: {
    type: String,
  },
  services: {
    type: String,
  },
  clientName: {
    type: String,
  },
  designation: {
    type: String,
  },
  qr: {
    type: String,
  },
  address: {
    type: String,
  },
  whatsapp01: {
    type: String,
  },
  location: {
    type: String,
  },
  whatsapp02: {
    type: String,
  },
  whatsapp03: {
    type: String,
  },
  instagramLink: {
    type: String,
  },
  instagramLink02: {
    type: String,
  },
  instagramLink03: {
    type: String,
  },
  instagramName: {
    type: String,
  },
  instagramName02: {
    type: String,
  },
  instagramName03: {
    type: String,
  },
  snapchatLink: {
    type: String,
  },
  snapchatLink02: {
    type: String,
  },
  snapchatLink03: {
    type: String,
  },
  snapchatName: {
    type: String,
  },
  snapchatName02: {
    type: String,
  },
  snapchatName03: {
    type: String,
  },
  youtubeLink: {
    type: String,
  },
  youtubeLink02: {
    type: String,
  },
  youtubeLink03: {
    type: String,
  },
  youtubeName: {
    type: String,
  },
  youtubeName02: {
    type: String,
  },
  youtubeName03: {
    type: String,
  },
  tiktokLink: {
    type: String,
  },
  tiktokLink02: {
    type: String,
  },
  tiktokLink03: {
    type: String,
  },
  tiktokName: {
    type: String,
  },
  tiktokName02: {
    type: String,
  },
  tiktokName03: {
    type: String,
  },
  twitterLink: {
    type: String,
  },
  twitterLink02: {
    type: String,
  },
  twitterLink03: {
    type: String,
  },
  twitterName: {
    type: String,
  },
  twitterName02: {
    type: String,
  },
  twitterName03: {
    type: String,
  },
  facebookLink: {
    type: String,
  },
  facebookLink02: {
    type: String,
  },
  facebookLink03: {
    type: String,
  },
  facebookName: {
    type: String,
  },
  facebookName02: {
    type: String,
  },
  facebookName03: {
    type: String,
  },
  googleReviewLink: {
    type: String,
  },
  googleReviewLink02: {
    type: String,
  },
  googleReviewLink03: {
    type: String,
  },
  googleReviewName: {
    type: String,
  },
  googleReviewName02: {
    type: String,
  },
  googleReviewName03: {
    type: String,
  },
  website: {
    type: String,
  },
  website02: {
    type: String,
  },
  website03: {
    type: String,
  },
  websiteName: {
    type: String,
  },
  websiteName02: {
    type: String,
  },
  websiteName03: {
    type: String,
  },
  email: {
    type: String,
  },
  email02: {
    type: String,
  },
  email03: {
    type: String,
  },
  youtubeShortsLink: {
    type: String,
  },
  youtubeShortsLink02: {
    type: String,
  },
  youtubeShortsLink03: {
    type: String,
  },
  youtubeShortsName: {
    type: String,
  },
  youtubeShortsName02: {
    type: String,
  },
  youtubeShortsName03: {
    type: String,
  },
  googleMapLink: {
    type: String,
  },
  googleMapLink02: {
    type: String,
  },
  googleMapLink03: {
    type: String,
  },
  googleMapName: {
    type: String,
  },
  googleMapName02: {
    type: String,
  },
  googleMapName03: {
    type: String,
  },
  menuLink: {
    type: String,
  },
  menuName: {
    type: String,
  },
  catalogueLink: {
    type: String,
  },
  catalogueName: {
    type: String,
  },
  profileLink01: {
    type: String,
  },
  profileLink02: {
    type: String,
  },
  profileName01: {
    type: String,
  },
  profileName02: {
    type: String,
  },
  logo: {
    type: String,
  },
  romanName: {
    type: String,
  },

  images: {
    type: String,
  },
  img01: {
    type: String,
  },
  img02: {
    type: String,
  },
  img03: {
    type: String,
  },
  img04: {
    type: String,
  },
  img05: {
    type: String,
  },
  img06: {
    type: String,
  },
  img07: {
    type: String,
  },
  img08: {
    type: String,
  },
  img09: {
    type: String,
  },
  img10: {
    type: String,
  },
  color01: {
    type: String,
  },
  color02: {
    type: String,
  },
  color03: {
    type: String,
  },
  password: {
    type: String,
    select: false,
  },
  visitCount: {
    type: Number,
  },
  option: {
    type: String,
  },
});

const removePrivateFields = (_, result) => {
  delete result.password;
  delete result.flag;
  return result;
};

clientSchema.set("toJSON", { transform: removePrivateFields });
clientSchema.set("toObject", { transform: removePrivateFields });

const Client = mongoose.model("Client", clientSchema, "clients");
module.exports = Client;

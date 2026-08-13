export interface PersonInfo {
  name: string;
  nameFull: string;
  fatherName: string;
  motherName: string;
  phone: string;
  account: { bank: string; number: string; holder: string };
}

export interface WeddingData {
  slug: string;
  template: string;
  theme: string;
  groom: PersonInfo;
  bride: PersonInfo;
  date: {
    year: number;
    month: number;
    day: number;
    dayOfWeek: string;
    time: string;
    iso: string;
  };
  venue: {
    name: string;
    hall: string;
    address: string;
    addressShort: string;
    kakaoMapUrl: string;
    naverMapUrl: string;
    lat: number;
    lng: number;
  };
  greeting: string[];
  rsvpMessage: string[];
  gallery: { src: string; alt: string }[];
  introBg: string;
  envelopeClosed: string;
  envelopeOpen: string;
}

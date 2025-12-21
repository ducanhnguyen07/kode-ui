export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  {
    text: "Học một nghề để đi khắp thiên hạ không sợ.",
    author: "Tục ngữ Việt Nam",
  },
  {
    text: "Có công mài sắt có ngày nên kim.",
    author: "Tục ngữ Việt Nam",
  },
  {
    text: "Học thầy không tày học bạn.",
    author: "Tục ngữ Việt Nam",
  },
  {
    text: "Kiến tha lâu đầy tổ, nhờ công chuyên cần.",
    author: "Tục ngữ Việt Nam",
  },
  {
    text: "Người kém cỏi luôn đổ lỗi cho công cụ của họ.",
    author: "Ngạn ngữ phương Tây",
  },
  {
    text: "Đầu tư vào tri thức luôn mang lại lợi ích tốt nhất.",
    author: "Benjamin Franklin",
  },
  {
    text: "Học hỏi không bao giờ là muộn.",
    author: "Ngạn ngữ phương Tây",
  },
  {
    text: "Sự kiên trì là mẹ của thành công.",
    author: "Tục ngữ Việt Nam",
  },
  {
    text: "Trăm hay không bằng tay quen.",
    author: "Tục ngữ Việt Nam",
  },
  {
    text: "Những người tích trữ vàng chỉ giàu có trong chốc lát. Những người tích trữ kiến thức và kỹ năng giàu có suốt đời.",
    author: "The Diary of a CEO",
  },
  {
    text: "Chậm mà chắc.",
    author: "Tục ngữ Việt Nam",
  },
  {
    text: "Muốn đi nhanh thì đi một mình, muốn đi xa thì đi cùng nhau.",
    author: "Ngạn ngữ châu Phi",
  },
  {
    text: "Thất bại là mẹ thành công.",
    author: "Ngạn ngữ phương Tây",
  },
  {
    text: "Học để biết, học để làm, học để chung sống, học để tự khẳng định mình.",
    author: "UNESCO",
  },
  {
    text: "Không có gì quý hơn độc lập tự do, nhưng tri thức là chìa khóa để có được nó.",
    author: "Hồ Chí Minh (ý nghĩa)",
  },
];

export const getRandomQuote = (): Quote => {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
};

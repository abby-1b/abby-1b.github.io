
#include <iostream>
#include <string>

std::string _(std::string i) { std::cout << i; return i; }
float       _(float i)       { std::cout << i; return i; }

float       _sum(float a      , float b      ) { return a + b; }
std::string _sum(std::string a, float b      ) { return a + std::to_string(b); }
std::string _sum(float a      , std::string b) { return std::to_string(a) + b; }
std::string _sum(std::string a, std::string b) { return a + b; }

float       _mul(float a      , float b      ) { return a * b; }
std::string _mul(std::string a, int b        ) { std::string r = ""; for (int c = 0; c < b; c++) { r += a; } return r; }

int         _eql(float a      , float b      ) { return a == b; }
int         _eql(std::string a, std::string b) { return a == b; }
int         _lss(float a      , float b      ) { return a < b; }
int         _lss(std::string a, std::string b) { return a.length() < b.length(); }
int         _mrr(float a      , float b      ) { return a > b; }
int         _mrr(std::string a, std::string b) { return a.length() > b.length(); }

int main() {
    _(_lss(std::string("a"), std::string("heyy")));
    std::cout << '\n';
    return 0;
}

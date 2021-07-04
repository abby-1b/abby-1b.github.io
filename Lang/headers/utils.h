#ifndef CONVERSIONS_H
#define CONVERSIONS_H

#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class String {
    public:
        static inline int toint(string a) {
            try {
                return stoi(a);
            } catch (...) {
                return 0;
            }
        }
        static inline string lower(string a) {
            transform(a.begin(), a.end(), a.begin(), [](unsigned char c){ return tolower(c); });
            return a;
        }
        static inline string upper(string a) {
            transform(a.begin(), a.end(), a.begin(), [](unsigned char c){ return toupper(c); });
            return a;
        }
        static inline int len(string a) {
            return a.length();
        }
        static inline string add(string a, string b) {
            return a + "," + b;
        }
};

class Array {
    public:
        template <class T>
        static inline string toString(vector<T> i) {
            string ret = "[";
            for (int a = 0; a < i.size(); a++) {
                if (a != 0) ret += ", ";
                ret += to_string(i[a]);
            }
            return ret;
        }
        static inline string toString(vector<string> i) {
            string ret = "[\"";
            for (int a = 0; a < i.size(); a++) {
                if (a != 0) ret += "\", \"";
                ret += i[a];
            }
            return ret + "\"]";
        }
        template <class T>
        static inline int len(vector<T> i) {
            return i.size();
        }
};

#endif
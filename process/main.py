import csv
from dataclasses import dataclass
from typing import Dict, List, Set


@dataclass
class Row:
    netID: str
    fullName: str
    email: str
    role: str
    shiftsAvailability: Dict[str, List[int]]  # example: {"10:00-12:00": [1, 2, 3]}


DayColumnMap: Dict[str, int] = {
    "周一空闲时间": 1,
    "周二空闲时间": 2,
    "周三空闲时间": 3,
    "周四空闲时间": 4,
    "周五空闲时间": 5,
    "周六空闲时间": 6,
    "周日空闲时间": 7,
}


def main():
    usersMap: Dict[str, Row] = {}  # netID -> Row
    all_shifts: Set[str] = set()

    # 先读取所有行，获取所有的 shift
    with open("raw.csv", mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            for key, _ in DayColumnMap.items():
                shifts = row[key].split(", ")
                for shift in shifts:
                    if shift.startswith('"'):
                        shift = shift[1:]
                    if shift.endswith('"'):
                        shift = shift[:-1]
                    if shift != "":
                        all_shifts.add(shift)

    with open("raw.csv", mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            usersMap[row["NetID"]] = Row(
                netID=row["NetID"],
                fullName=row["姓名"],
                email=row["NetID"] + "@mail2.sysu.edu.cn",
                role=(
                    "普通助理"
                    if row["我太想进步啦"] == "我想继续学习！"
                    else "资深助理"
                ),
                shiftsAvailability={},
            )

            for key, value in DayColumnMap.items():
                shifts = row[key].split(", ")
                for shift in shifts:
                    if shift.startswith('"'):
                        shift = shift[1:]
                    if shift.endswith('"'):
                        shift = shift[:-1]

                    if shift not in usersMap[row["NetID"]].shiftsAvailability:
                        usersMap[row["NetID"]].shiftsAvailability[shift] = []

                    usersMap[row["NetID"]].shiftsAvailability[shift].append(value)

    with open("processed.csv", mode="w", encoding="utf-8") as file:
        fieldNames = ["NetID", "姓名", "邮箱", "角色"]
        for shift in sorted(all_shifts):
            fieldNames.append(shift)

        writer = csv.DictWriter(file, fieldnames=fieldNames)
        writer.writeheader()

        for user in usersMap.values():
            row = {
                "NetID": user.netID,
                "姓名": user.fullName,
                "邮箱": user.email,
                "角色": user.role,
            }
            for shift in all_shifts:
                if shift in user.shiftsAvailability:
                    if len(user.shiftsAvailability[shift]) == 1:
                        row[shift] = user.shiftsAvailability[shift][0]
                    else:
                        row[shift] = ", ".join(map(str, user.shiftsAvailability[shift]))
                else:
                    row[shift] = ""

            writer.writerow(row)


if __name__ == "__main__":
    main()

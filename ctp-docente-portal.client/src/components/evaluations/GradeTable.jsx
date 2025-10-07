import React from "react";
import { getGradeColor, getResponsiveGridCols } from "../../utils/gradeUtils";
import { Separator } from "../ui/Separator";
import { NavLink } from "react-router-dom";
import { SquareArrowOutUpRight } from "lucide-react";
import Input from "../ui/Input";
import { Card, CardContent } from "../ui/Card";
import { Label } from "../ui/Label";
import Tooltip from "../Tooltip";

const GradeTable = ({
  students,
  criteria,
  isEditing,
  getGradeValue,
  onGradeChange,
  showRubricLink = false,
  getFinalGrade,
  readOnlyCondition = () => false,
}) => {
  const columns = criteria.length + 1;

  const mdGridCols = getResponsiveGridCols(columns);

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <Card key={student.studentId} className="pt-4">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="w-full">
                <h3 className="font-bold text-lg text-center md:text-start my-2">
                  {student.studentName}
                </h3>
              </div>

              <Separator
                orientation="vertical"
                className="hidden lg:block h-16"
              />

              <div className="flex-1">
                <div className={`grid grid-cols-2 ${mdGridCols} gap-3`}>
                  {criteria.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center justify-between space-y-1"
                    >
                      <div className="flex items-center justify-around w-full">
                        <Label className="text-xs font-medium text-center flex items-center">
                          {item.name}
                        </Label>

                        {showRubricLink && item.hasCriteria && (
                          <div className="relative group inline-block">
                            <NavLink
                              to={`/item/${item.id}/calificar/${student.studentId}`}
                            >
                              <button className="hover:text-blue-600 hover:dark:text-blue-400">
                                <SquareArrowOutUpRight className="h-4 w-4" />
                              </button>
                            </NavLink>
                            <Tooltip
                              message={"Calificar item con rúbrica"}
                              possition={"bottom-full"}
                            />
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={getGradeValue(student, item, index) || ""}
                          onChange={(e) =>
                            onGradeChange(
                              student.studentId,
                              item,
                              index,
                              e.target.value
                            )
                          }
                          className={`text-center bg-gray-100 dark:bg-slate-800 font-semibold ${getGradeColor(
                            getGradeValue(student, item, index) || 0
                          )}`}
                          placeholder="0-100"
                          readOnly={
                            !isEditing || readOnlyCondition(item, student)
                          }
                        />
                        {item.hasCriteria && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col items-center justify-between space-y-1">
                    <div className="flex items-center justify-around w-full">
                      <Label className="text-sm font-bold text-center flex items-center">
                        Nota Final
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        value={getFinalGrade(student)}
                        readOnly
                        className={`text-center bg-gray-100 dark:bg-slate-800 font-semibold max-w-20 ${getGradeColor(
                          getFinalGrade(student)
                        )}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GradeTable;

import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { safeRedirect } from "remix-utils";
import { getTeacherByUserId } from "~/adapters/teacher.adapter";
import PaymentForm from "~/components/payment-form";
import { getLesson } from "~/handlers/lessons.server";
import { getCreditsForStudent } from "~/handlers/students.server";
import { ErrorType } from "~/types/errors";
import { PaymentMethod, PaymentStatus } from "~/types/payment";
import { AppError } from "~/utils/app-error";
import { assertNumber, assertString } from "~/utils/misc";
import { getUserId } from "~/utils/session.server";

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    const teacher = await getTeacherByUserId(userId);
    if (teacher) {
      const { lessonId, paymentIndex } = params;
      if (!lessonId) {
        throw new AppError({ errType: ErrorType.LessonNotFound });
      }
      const index = Number(paymentIndex);
      assertNumber(index);

      const formData = await request.formData();
      const price = Number(formData.get("price"));
      assertNumber(price);
      const paymentMethod = formData.get("paymentMethod")?.toString() as
        | PaymentMethod
        | undefined;
      let sum = undefined;
      if (formData.has("sum") && !isNaN(Number(formData.get("sum")))) {
        sum = Number(formData.get("sum"));
      }
      const creditId = formData.get("creditId")?.toString();

      // if (
      //   !(await updatePayment({
      //     lessonId,
      //     paymentIndex: index,
      //     paymentMethod,
      //     sum,
      //     creditId,
      //   }))
      // ) {
      //   return json({
      //     fields: {
      //       paymentStatus: formData
      //         .get("paymentStatus")
      //         ?.toString() as PaymentStatus,
      //       paymentMethod,
      //       sum,
      //       creditId,
      //     },
      //     error: "???? ???????????? ???????????? ???? ???????????? ????????????.",
      //   });
      // }

      return redirect(safeRedirect(`/lessons/${lessonId}`, "/lessons"));
    } else {
      throw new AppError({ errType: ErrorType.TeacherNotFound });
    }
  } else {
    throw new AppError({ errType: ErrorType.UserNotFound });
  }
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    const teacher = await getTeacherByUserId(userId);
    if (teacher) {
      const { lessonId = "", paymentIndex } = params;
      assertString(lessonId);
      const index = Number(paymentIndex);
      assertNumber(index);
      const lesson = await getLesson(teacher.id, lessonId);
      if (!lesson) {
        throw new AppError({ errType: ErrorType.LessonNotFound });
      }
      const credits =
        typeof lesson.student === "string"
          ? []
          : await getCreditsForStudent(lesson.student);
      // const payment = lesson.payments[index];

      return json({ lesson, credits });
    } else {
      throw new AppError({ errType: ErrorType.TeacherNotFound });
    }
  } else {
    throw new AppError({ errType: ErrorType.UserNotFound });
  }
};

export default function EditPaymentPage() {
  const { lesson, credits } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const paymentStatus = PaymentStatus.DIRECT;

  return (
    <div className="max-w-[672px] flex-1 overflow-auto px-2 pb-2">
      {/* <header className="mb-4 sm:mb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          ?????????? ??????????
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          ?????? ???? ???????? ?????? ???????? ?????????? ??????????.
        </p>
      </header> */}
      <PaymentForm
        id="update-payment-form"
        price={lesson.price}
        credits={credits}
      />

      <div className="mt-6 flex flex-col justify-end space-y-3 space-y-reverse rtl:space-x-reverse sm:flex-row sm:items-center sm:space-y-0 sm:space-x-5">
        <Link
          to={`/lessons/${lesson.id}`}
          className="order-2 rounded-md border-0 border-gray-300 bg-white text-center font-medium text-orange-500 shadow-none hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:text-sm"
        >
          ??????????
        </Link>
        <button
          type="submit"
          form="update-payment-form"
          className="order-1 inline-flex justify-center rounded-md border border-transparent bg-amber-500 py-2.5 px-4 font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:order-3 sm:py-2 sm:text-sm"
        >
          ???????? ??????????
        </button>
      </div>
    </div>
  );
}
